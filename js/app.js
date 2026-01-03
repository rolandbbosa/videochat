class RandomVideoChat {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.currentRoom = null;
        this.isInitiator = false;
        this.userId = this.generateUserId();
        this.statusElement = document.getElementById('status');
        this.startBtn = document.getElementById('startBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.reportBtn = document.getElementById('reportBtn');
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');

        this.initEventListeners();
        this.initWebRTC();
    }

    generateUserId() {
        return Math.random().toString(36).substr(2, 9);
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startChat());
        this.nextBtn.addEventListener('click', () => this.nextChat());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        this.reportBtn.addEventListener('click', () => this.reportUser());
    }

    initWebRTC() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        this.peerConnection = new RTCPeerConnection(configuration);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendMessage({ type: 'candidate', candidate: event.candidate });
            }
        };

        this.peerConnection.ontrack = (event) => {
            this.remoteVideo.srcObject = event.streams[0];
            this.remoteStream = event.streams[0];
        };

        this.peerConnection.onconnectionstatechange = () => {
            if (this.peerConnection.connectionState === 'connected') {
                this.statusElement.textContent = 'Connected! Start chatting.';
                this.nextBtn.disabled = false;
                this.disconnectBtn.disabled = false;
                this.reportBtn.disabled = false;
            }
        };
    }

    async startChat() {
        try {
            this.statusElement.textContent = 'Requesting camera and microphone access...';
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.localVideo.srcObject = this.localStream;
            this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

            this.startBtn.disabled = true;
            this.statusElement.textContent = 'Looking for a partner...';
            this.findPartner();
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.statusElement.textContent = 'Error: Could not access camera/microphone. Please check permissions.';
        }
    }

    findPartner() {
        const waitingRef = database.ref('waiting');
        waitingRef.push({ userId: this.userId, timestamp: Date.now() });

        waitingRef.on('value', (snapshot) => {
            const waitingUsers = snapshot.val();
            if (!waitingUsers) return;

            const userIds = Object.keys(waitingUsers);
            if (userIds.length >= 2) {
                // Find another user
                const otherUserId = userIds.find(id => id !== this.userId);
                if (otherUserId) {
                    this.currentRoom = this.generateRoomId(this.userId, otherUserId);
                    this.isInitiator = this.userId < otherUserId;

                    // Remove from waiting
                    waitingRef.child(this.userId).remove();
                    waitingRef.child(otherUserId).remove();

                    this.startSignaling();
                }
            }
        });
    }

    generateRoomId(user1, user2) {
        return [user1, user2].sort().join('_');
    }

    startSignaling() {
        const roomRef = database.ref('rooms/' + this.currentRoom);

        roomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            if (data.type === 'offer' && !this.isInitiator) {
                this.handleOffer(data);
            } else if (data.type === 'answer' && this.isInitiator) {
                this.handleAnswer(data);
            } else if (data.type === 'candidate') {
                this.handleCandidate(data);
            }
        });

        if (this.isInitiator) {
            this.createOffer();
        }
    }

    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.sendMessage({ type: 'offer', offer: offer });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    async handleOffer(data) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.sendMessage({ type: 'answer', answer: answer });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(data) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    async handleCandidate(data) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
            console.error('Error handling candidate:', error);
        }
    }

    sendMessage(message) {
        database.ref('rooms/' + this.currentRoom).set(message);
    }

    nextChat() {
        this.disconnect();
        this.startChat();
    }

    disconnect() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        if (this.remoteStream) {
            this.remoteStream = null;
        }
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        this.currentRoom = null;
        this.isInitiator = false;

        // Remove from database
        if (this.currentRoom) {
            database.ref('rooms/' + this.currentRoom).remove();
        }

        this.statusElement.textContent = 'Disconnected. Click Start to begin again.';
        this.startBtn.disabled = false;
        this.nextBtn.disabled = true;
        this.disconnectBtn.disabled = true;
        this.reportBtn.disabled = true;

        this.initWebRTC(); // Reinitialize for next connection
    }

    reportUser() {
        if (this.currentRoom) {
            // In a real app, you'd send this to a moderation service
            alert('User reported. Thank you for helping keep the community safe.');
            // For now, just disconnect
            this.disconnect();
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RandomVideoChat();
});