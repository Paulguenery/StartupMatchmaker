import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Play } from "lucide-react";

interface VideoChatProps {
  projectId: number;
  userId: number;
  onClose: () => void;
}

export function VideoChat({ projectId, userId, onClose }: VideoChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket>();
  const peerConnectionRef = useRef<RTCPeerConnection>();

  useEffect(() => {
    // Configuration des serveurs STUN pour WebRTC
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    };

    // Initialisation de la connexion WebRTC
    peerConnectionRef.current = new RTCPeerConnection(configuration);

    // Connexion au serveur de signalisation en mode production
    if (!isTestMode) {
      socketRef.current = io(window.location.origin);

      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        socketRef.current?.emit('join-room', { projectId, userId });
      });

      // Configuration des événements de signalisation
      setupSignaling();
    }

    // Gestion des flux médias
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // En mode test, on duplique le flux local vers le flux distant
        if (isTestMode && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream.clone();
        } else {
          stream.getTracks().forEach(track => {
            peerConnectionRef.current?.addTrack(track, stream);
          });
        }
      })
      .catch((error) => {
        console.error('Erreur d\'accès aux périphériques média:', error);
      });

    return () => {
      // Nettoyage
      if (!isTestMode) {
        socketRef.current?.disconnect();
      }
      peerConnectionRef.current?.close();
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [projectId, userId, isTestMode]);

  const setupSignaling = () => {
    if (!socketRef.current) return;

    socketRef.current.on('user-connected', async (data) => {
      try {
        const offer = await peerConnectionRef.current?.createOffer();
        await peerConnectionRef.current?.setLocalDescription(offer);
        socketRef.current?.emit('offer', { offer, to: data.userId });
      } catch (error) {
        console.error('Erreur lors de la création de l\'offre:', error);
      }
    });

    socketRef.current.on('offer', async (data) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current?.createAnswer();
        await peerConnectionRef.current?.setLocalDescription(answer);
        socketRef.current?.emit('answer', { answer, to: data.from });
      } catch (error) {
        console.error('Erreur lors du traitement de l\'offre:', error);
      }
    });

    socketRef.current.on('answer', async (data) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Erreur lors du traitement de la réponse:', error);
      }
    });

    socketRef.current.on('ice-candidate', async (data) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Erreur lors de l\'ajout du candidat ICE:', error);
      }
    });
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background">
      <CardContent className="flex-1 p-6">
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg bg-muted"
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-sm text-white bg-black/50 px-2 py-1 rounded">
                Vous
              </p>
            </div>
          </div>
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg bg-muted"
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-sm text-white bg-black/50 px-2 py-1 rounded">
                {isTestMode ? "Aperçu du test" : "Interlocuteur"}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVideo}
            className={!isVideoEnabled ? "bg-destructive text-destructive-foreground" : ""}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAudio}
            className={!isAudioEnabled ? "bg-destructive text-destructive-foreground" : ""}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsTestMode(!isTestMode)}
            className={isTestMode ? "bg-amber-500 text-white" : ""}
            title={isTestMode ? "Désactiver le mode test" : "Activer le mode test"}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onClose}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}