import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import styles from "./style.module.scss";
import WeuiClose2Outlined from "@/components/Backbutton";
import Link from "next/link";
import { FaMicrophone } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { app } from "@/firebase/client"; // Firebaseの初期化コードをインポート

const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

const Onsei_sakusei2 = () => {
  const router = useRouter();
  const { videoUrl } = router.query; // クエリパラメータから動画URLを取得
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // 保存中かどうかの状態
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // 録音データを保存する配列
  const videoRef = useRef<HTMLVideoElement>(null); // 動画要素を参照
  const audioRef = useRef<HTMLAudioElement>(null); // 音声要素を参照

  const startRecording = async () => {
    const user = auth.currentUser; // 現在のログインユーザーを取得
    if (!user) {
      alert("録音を開始するにはログインが必要です。");
      return; // ユーザーがログインしていない場合、録音を開始しない
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // 録音を開始する前にリセット

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data); // 録音データを配列に保存
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          // 録音した音声をaudio要素で再生できるようにセット
          const audioUrl = URL.createObjectURL(audioBlob);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
          }
          console.log("録音データ:", audioBlob);
        } else {
          console.error("録音データが空です");
        }
      };

      mediaRecorder.start();
      console.log("録音を開始しました");
      setIsRecording(true);

      // 動画を再生
      if (videoRef.current) {
        videoRef.current.play();
      }
    } catch (err) {
      console.error("マイクアクセスエラー:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      console.log("録音を停止しました。");
    }

    // 動画を停止
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // 動画を最初に戻す（必要なら）
    }

    setIsRecording(false);
  };

  const playAudioWithVideo = () => {
    if (videoRef.current && audioRef.current) {
      videoRef.current.play();
      audioRef.current.play(); // 音声を再生
    }
  };

  const uploadAudioToFirebase = async (audioBlob: Blob) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("ユーザーが認証されていません");
      }

      const audioFileName = `audio_${Date.now()}.wav`;
      const audioStorageRef = ref(
        storage,
        `user_audio/${user.uid}/${audioFileName}`
      );

      // Firebase Storageに音声ファイルをアップロード
      const snapshot = await uploadBytes(audioStorageRef, audioBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Firestoreに新しいドキュメントをユーザーUIDのサブコレクションに作成して保存する
      const audioCollectionRef = collection(
        firestore,
        `user_audio/${user.uid}/audio`
      );

      await addDoc(audioCollectionRef, {
        videoUrl, // ビデオのURL
        audioUrl: downloadURL, // 音声ファイルのURL
        createdAt: Date.now(), // 現在の日時をタイムスタンプで保存
        isPublic: true, // 公開かどうか
      });

      console.log("音声がFirebaseに新規保存されました:", downloadURL);
      alert("音声が保存されました！");
    } catch (err) {
      console.error("音声の保存中にエラーが発生しました:", err);
    } finally {
      setIsSaving(false); // 保存中フラグを解除
    }
  };

  const saveAudio = () => {
    if (audioChunksRef.current.length === 0) {
      console.error("保存できる音声データがありません");
      return;
    }

    setIsSaving(true); // 保存中フラグを設定
    const audioBlob = new Blob(audioChunksRef.current, {
      type: "audio/wav",
    });
    uploadAudioToFirebase(audioBlob);
  };

  return (
    <>
      <div className={styles.moviebox}>
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            width="100%"
            controlsList="nodownload"
            onEnded={stopRecording} // 動画が終了したときに録音を停止
          >
            <source src={videoUrl as string} type="video/mp4" />
            お使いのブラウザは動画タグをサポートしていません。
          </video>
        ) : (
          <p>動画が選択されていません。</p>
        )}
      </div>

      {/* 録音した音声を再生するaudio要素 */}
      <audio ref={audioRef} controls hidden />

      <div
        className={styles.microphoneIconContainer}
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
      >
        <div className={isRecording ? styles.recordingIndicator : ""}>
          <FaMicrophone className={styles.microphoneIcon} />
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.onseisaiseibox}>
          {/* 音声と動画を一緒に再生 */}
          <button className={styles.onseisaisei} onClick={playAudioWithVideo}>
            音声動画再生
          </button>
        </div>
      </div>
      <div
        className={styles.hozonbox}
        onClick={saveAudio} // hozonbox全体がクリックされたときに保存処理を実行
        style={{ cursor: isSaving ? "not-allowed" : "pointer" }} // 保存中はクリックできないように視覚的に変化
      >
        {/* hozonボタンを削除し、div自体をクリックで発動 */}
        {isSaving ? "保存中..." : "保存"}
      </div>
      <Link href="/seisaku_page2">
        <WeuiClose2Outlined className={styles.backbutton} />
      </Link>
    </>
  );
};

export default Onsei_sakusei2;
