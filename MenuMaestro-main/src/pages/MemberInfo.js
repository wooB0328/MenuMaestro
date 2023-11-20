import React from 'react';
import '../css/memberinfo.css'
function MemberInfo(){
    return (
      <div className='box'>
        <div className="section_title">운영 단원 소개</div>
        <div className="dotted-line-container">
        <div className="dotted-line" />
        </div>
        <table className='member_table'>
          <tr>
            <td>
              <img className="members" src="https://i.ibb.co/PNf15Ms/1.png" />
            </td>
            <td>
              <img className="members" src="https://i.ibb.co/QdBd2fP/2.png" />
            </td>
          </tr>
          <tr>
            <td>
            <img className="members" src="https://i.ibb.co/bz4QmRX/3.png" />
            </td>
            <td>
            <img className="members" src="https://i.ibb.co/C2kh6MQ/4.png" />
            </td>
          </tr>
        </table>
      </div>
    );
  }

export default MemberInfo;