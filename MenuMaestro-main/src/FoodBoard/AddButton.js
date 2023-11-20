import React, { useState, useEffect } from 'react';
import './FoodBoard.css';
import Modal from 'react-modal';
import { app } from './Storegy.jsx';
import { getStorage, ref as storageReference, uploadBytes, getDownloadURL,} from "firebase/storage";

const AddButton = function ({ onNewColor = f => f }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [detailValue, setDetailValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const uploadImage = async () => {
    if (selectedImage) {
      console.log("파일 업로드 시작");
      const storage = getStorage(app); //스토리지 가져오기
      const storageRef = storageReference(storage, 'FoodBoard/' + selectedImage.name);
      await uploadBytes(storageRef, selectedImage);
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    }
    else{
      console.log("파일이 재대로 전달되지 않음.")
    }
  };

  useEffect(() => {  //날짜 자동 입력
    if (isModalOpen) {
      const currentDate = new Date().toISOString().slice(0, 10);
      setDateValue(currentDate);
    }
  }, [isModalOpen]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async () => {
    let URL = await uploadImage();
    console.log("사진 업로드 끝. url 얻어옴. URL = " + URL);
    onNewColor(titleValue, detailValue, dateValue, URL);
    console.log("OnNewColor에 집어넣음. ");
    setTitleValue("");
    setDetailValue("");
    setDateValue("");
    closeModal();
  };

  const handleTitleChange = (e) => {
    setTitleValue(e.target.value);
  };

  const handleDetailChange = (e) => {
    setDetailValue(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateValue(e.target.value);
  };

  return (
    <div id="Foodboard">
      <button className="ranking" onClick={openModal}>
        글쓰기
      </button>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} id="boardModal">
        <center>
          <h1 style={{ textAlign: 'center' }}>글쓰기</h1>
          <hr></hr>
          <table id="boardTable">
            <tbody>
              <tr>
                <th>메뉴 이름 *</th>
                <td>
                  <input
                    id="title"
                    type="text"
                    placeholder="메뉴 이름을 적어주세요."
                    value={titleValue}
                    onChange={handleTitleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>내용</th>
                <td>
                  <textarea
                    id="detail"
                    rows={3}
                    type="text"
                    placeholder="내용을 입력하세요."
                    value={detailValue}
                    onChange={handleDetailChange}
                  />
                </td>
              </tr>
              <tr>
                <th>이미지 파일 업로드</th>
                <td>
                <input type="file" onChange={handleFileChange}></input>
                </td>
              </tr>

              <tr>
                <th>날짜</th>
                <td>
                  <input
                    id="date"
                    type="text"
                    value={dateValue}
                    onChange={handleDateChange}
                    disabled
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            <button onClick={handleSubmit}>업로드</button>
            <img className='reject_board' src="https://i.ibb.co/YZbWQM5/reject.png" onClick={closeModal} />
          </div>
        </center>
      </Modal>
    </div>
  );
};

export default AddButton;
