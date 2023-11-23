import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useState, useEffect } from 'react';
import { ref, get, push } from "firebase/database";
import { useDatabase } from "../contexts";
//*  파이어스토리지 사용 > 따로 추가했습니다. +파이어베이스 참조부분도 변경했습니다 index.jsx참고
import { getStorage, ref as storageReference, uploadBytes, getDownloadURL,} from "firebase/storage";

function MenuAdd() {
  const { database } = useDatabase();
  const dbRef = ref(database, 'addmenu');
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.values(data);
        setMenus(dataArray);
      }
    });
  }, [dbRef]);

  const handleNewMenu = async (e) => {
   e.preventDefault();
 
   const nameValue = e.target.elements.menuName.value.trim();
   const category1Value = e.target.elements.menuCategory1.value;
   const category2Value = e.target.elements.menuCategory2.value;
   const file = e.target.elements.file.files[0];
 
   // 파일이 선택되었을 때만 업로드 수행
   if (file) {
     try {
       console.log("파일 업로드 시작:", file.name);
       const storage = getStorage();
       const storageRef = storageReference(storage, 'adduser/' + file.name);
       //* 이거 파일 겹치면 안되서 영범님은 adduser말고 다른파일명으로 작성해주세요!
 
       // 파일 업로드
       await uploadBytes(storageRef, file);
 
       console.log("파일 업로드 완료. 다운로드 URL 획득 중...");
       // 업로드된 파일의 다운로드 URL 획득
       const fileURL = await getDownloadURL(storageRef);
 
       console.log("다운로드 URL:", fileURL);

       // Realtime Database에 저장
       const newMenu = {
         name: nameValue,
         category1: category1Value,
         category2: category2Value,
         file: fileURL,
       };
 
       const newMenuRef = push(dbRef, newMenu);
       console.log("새로 생성된 데이터의 키:", newMenuRef.key);
      alert("사용자님의 소중한 정보가 전송되었습니다.\n 해당 정보는 관리자가 승인하여 1~2일이 소요 됩니다.^^ ");
     } catch (error) {
       console.error("파일 업로드 또는 데이터 저장 중 오류:", error);
     }
   } else {
     // 파일이 선택되지 않은 경우에는 URL을 null로 저장
     const newMenu = {
       name: nameValue,
       category1: category1Value,
       category2: category2Value,
       file: null,
     };
 
     const newMenuRef = push(dbRef, newMenu);
     console.log("새로 생성된 데이터의 키:", newMenuRef.key);
     alert("성공적으로 접수되었습니다! 메뉴 추가는 관리자의 승인이 필요하며 1~2일 정도 소요됩니다. ")
   }
 
   e.target.reset();
 };
 

  return (
    <>
      <div>
        <div className ="section_title">메뉴 추가</div>
        <div className="dotted-line-container">
          <div className="dotted-line" />
        </div>
        <p></p>
        <div className="add-menu-form" >
          <Form onSubmit={handleNewMenu}>
            <div className="box-border" style={{ border: '0.3vh solid #595959', padding: '2vh 2vw',  borderRadius: '1vw' }} >
            <Form.Group className="mb-3" controlId="menuName">
              <Form.Label style={{ fontSize: '3vh', fontWeight: 'bold' }}>메뉴 이름</Form.Label>
              <Form.Control type="text" placeholder='' required style={{ fontSize: '2.5vh'}} />
              <Form.Text style={{ fontSize: '2vh', color: 'rgb(67, 200, 208)', fontWeight: 'bold'}}>
                *필수 입력 값입니다.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-1" controlId="menuCategory1">
              <Form.Label style={{ fontSize: '3vh', fontWeight: 'bold' }}>카테고리 1</Form.Label>
              <Form.Select name="menuCategory1" required style={{ fontSize: '2.5vh'}}>
                <option>선택</option>
                <option>한식</option>
                <option>양식</option>
                <option>아시안식</option>
                <option>중식</option>
                <option>일식</option>
                <option>기타</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="menuCategory2"  style = {{marginTop: '2vh'}}>
              <Form.Label style={{ fontSize: '3vh', fontWeight: 'bold' }}>카테고리 2</Form.Label>
              <Form.Select name="menuCategory2" required style={{ fontSize: '2.5vh'}}>
                <option>선택</option>
                <option>밥</option>
                <option>면</option>
                <option>빵</option>
                <option>찌개</option>
                <option>탕</option>
                <option>국물</option>
                <option>육류</option>
                <option>해산물</option>
                <option>기타</option>
              </Form.Select>
            </Form.Group>
           

            <Form.Group className="position-relative mb-3">
              <Form.Label style={{ fontSize: '3vh', fontWeight: 'bold' }}>사진</Form.Label>
              <Form.Control type="file" name="file" style={{ fontSize: '2.5vh'}} />
            </Form.Group>
            </div>
            <Button variant="primary" type="submit" className='add_button'>
              추 가 하 기
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
}

export default MenuAdd;