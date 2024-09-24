import React, { useState } from "react";
import { BsPencil } from "react-icons/bs";

const Profile = ({ params }) => {
  // 現在のプロフィール情報
  const [currentUser, setCurrentUser] = useState({
    id: params?.id,
    name: "テストユーザー",
    username: "testuser",
    image: "https://via.placeholder.com/150",
    bio: "自己紹介文がここに表示されます。",
    gender: "男性", // 性別
    link: "https://example.com", // リンク
    followers: 44000,
    following: 10000,
    videos: ["動画1", "動画2", "動画3"], // サンプルの動画
    likes: ["いいねした動画1", "いいねした動画2"], // サンプルのいいね動画
    savedItems: ["保存した動画1", "保存した動画2"], // サンプルの保存項目
  });

  // 編集モーダルのステート
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedUsername, setEditedUsername] = useState(currentUser.username);
  const [editedBio, setEditedBio] = useState(currentUser.bio);
  const [editedGender, setEditedGender] = useState(currentUser.gender);
  const [editedLink, setEditedLink] = useState(currentUser.link);
  const [editedImage, setEditedImage] = useState(currentUser.image);
  const [activeTab, setActiveTab] = useState("videos"); // 現在アクティブなタブ

  // ファイル選択処理
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImage(reader.result); // 画像のプレビュー表示
      };
      reader.readAsDataURL(file);
    }
  };

  // プロフィール更新処理
  const handleProfileUpdate = () => {
    setCurrentUser({
      ...currentUser,
      name: editedName,
      username: editedUsername,
      bio: editedBio,
      gender: editedGender,
      link: editedLink,
      image: editedImage,
    });
    setIsEditProfileOpen(false); // モーダルを閉じる
  };

  return (
    <div className="pt-16 flex flex-col items-center w-full max-w-7xl mx-auto">
      <div className="flex flex-col items-center">
        <img
          className="w-32 h-32 rounded-full"
          src={currentUser.image}
          alt="Profile"
        />
        <div className="mt-5 text-center">
          <h1 className="text-3xl font-bold">{currentUser.name}</h1>
          <p className="text-lg">@{currentUser.username}</p>
          <p className="text-lg">{currentUser.bio}</p>
          <p className="text-lg">性別: {currentUser.gender}</p>
          <p className="text-lg">
            リンク: <a href={currentUser.link}>{currentUser.link}</a>
          </p>
          <button
            onClick={() => setIsEditProfileOpen(true)} // 編集モーダルを開く
            className="mt-3 flex items-center px-4 py-2 border rounded"
          >
            <BsPencil className="mr-2" />
            プロフィールを編集
          </button>
        </div>
      </div>

      {/* フォロワー数とフォロー数 */}
      <div className="flex items-center justify-center pt-4">
        <div className="mr-4 text-center">
          <span className="font-bold">{currentUser.following}</span>
          <span className="text-gray-500 text-sm pl-1.5">Following</span>
        </div>
        <div className="mr-4 text-center">
          <span className="font-bold">{currentUser.followers}</span>
          <span className="text-gray-500 text-sm pl-1.5">Followers</span>
        </div>
      </div>

      {/* Videos, Likes, SavedItems タブ */}
      <ul className="w-full flex items-center justify-center pt-4 border-b">
        <li
          className={`w-60 text-center py-2 text-[17px] font-semibold cursor-pointer ${
            activeTab === "videos" ? "border-b-2 border-b-black" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </li>
        <li
          className={`w-60 text-center py-2 text-[17px] font-semibold cursor-pointer ${
            activeTab === "likes" ? "border-b-2 border-b-black" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("likes")}
        >
          Likes
        </li>
        <li
          className={`w-60 text-center py-2 text-[17px] font-semibold cursor-pointer ${
            activeTab === "savedItems" ? "border-b-2 border-b-black" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("savedItems")}
        >
          Saved Items
        </li>
      </ul>

      {/* Videos, Likes, SavedItems のコンテンツ */}
      <div className="pt-4">
        {activeTab === "videos" ? (
          <div>
            {currentUser.videos.length > 0 ? (
              <ul className="flex space-x-4"> {/* 横並びにするためにflexを使用 */}
                {currentUser.videos.map((video, index) => (
                  <li key={index} className="mb-2">
                    <div className="bg-gray-200 p-4 rounded w-48 h-48 flex items-center justify-center">
                      {video}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No videos available.</p>
            )}
          </div>
        ) : activeTab === "likes" ? (
          <div>
            {currentUser.likes.length > 0 ? (
              <ul className="flex space-x-4">
                {currentUser.likes.map((like, index) => (
                  <li key={index} className="mb-2">
                    <div className="bg-gray-200 p-4 rounded w-48 h-48 flex items-center justify-center">
                      {like}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No likes available.</p>
            )}
          </div>
        ) : activeTab === "savedItems" ? (
          <div>
            {currentUser.savedItems.length > 0 ? (
              <ul className="flex space-x-4">
                {currentUser.savedItems.map((item, index) => (
                  <li key={index} className="mb-2">
                    <div className="bg-gray-200 p-4 rounded w-48 h-48 flex items-center justify-center">
                      {item}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved items available.</p>
            )}
          </div>
        ) : null}
      </div>

      {/* 編集モーダル */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-[500px]">

            <h2 className="text-xl font-bold mb-4">プロフィール編集</h2>

            {/* プロフィール画像のプレビューと変更 */}
            <div className="mb-4">
              <p className="mb-2">プロフィール画像:</p>
              <img
                src={editedImage}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full mb-4"
              />
              <input type="file" onChange={handleImageChange} />
            </div>

            {/* 名前編集 */}
            <label className="block mb-2">
              名前:
              <input
                className="border p-2 w-full mt-1"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </label>

            {/* ユーザー名編集 */}
            <label className="block mb-2">
              ユーザー名:
              <input
                className="border p-2 w-full mt-1"
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
              />
            </label>

            {/* 自己紹介編集 */}
            <label className="block mb-2">
              自己紹介:
              <textarea
                className="border p-2 w-full mt-1"
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
              />
            </label>

            {/* 性別選択 */}
            <label className="block mb-2">
              性別:
              <select
                className="border p-2 w-full mt-1"
                value={editedGender}
                onChange={(e) => setEditedGender(e.target.value)}
              >
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="その他">その他</option>
              </select>
            </label>

            {/* リンク編集 */}
            <label className="block mb-2">
              リンク:
              <input
                className="border p-2 w-full mt-1"
                type="text"
                value={editedLink}
                onChange={(e) => setEditedLink(e.target.value)}
              />
            </label>

            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleProfileUpdate}
              >
                保存
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsEditProfileOpen(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
