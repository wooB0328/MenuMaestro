import React from 'react';
function MemberInfo(){
    return (
      <div className='box'>
        <div className="section_title">운영 단원 소개</div>
        <div className="dotted-line-container">
        <div className="dotted-line" />
        </div>
        <table className='member_table'>
          <tbody>
          <tr>
            <td>
              <img alt='members' className="members" src="https://i.ibb.co/PNf15Ms/1.png" />
            </td>
            <td>
              <img alt='members' className="members" src="https://i.ibb.co/QdBd2fP/2.png" />
            </td>
          </tr>
          <tr>
            <td>
            <img alt='members' className="members" src="https://i.ibb.co/bz4QmRX/3.png" />
            </td>
            <td>
            <img alt='members' className="members" src="https://i.ibb.co/C2kh6MQ/4.png" />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }

export default MemberInfo;