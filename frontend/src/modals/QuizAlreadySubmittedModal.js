import { useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { LanguageContext } from '../contexts/LanguageContext';

import confirm from '../assets/confirm.svg';
import prop from '../assets/prop.png';
import vote2 from '../assets/vote2.svg';


const QuizAlreadySubmittedModal = (props) => {
  let [isEnglish] = useContext(LanguageContext);

  return (
    <div>
    {isEnglish === 'english' ?
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal-2"
      >
        <div class="center"><div><img src={confirm} alt="Alert about verification" class="prop-img"/></div></div>
        <h1><span>Your address is ready </span></h1>
        <h3> You have completed the validation quiz and now you can create and vote on proposals on the urban governance page.</h3>
        <Modal.Body>
          <div class="void-link">
          <div class="prop-bgr"><a href="/Createproposal">
            <img src={prop} class="ribvan"/> 
            <div class="propsub">Create a proposal</div>
            <div class="propopt">Propose</div>
          </a></div>
          <div class="prop-bgr"><a href="/ProposalList">
            <img src={vote2} class="ribvan"/>
            <div class="propsub">Avalilable proposals</div>
            <div class="propopt">Vote</div>
          </a></div>
        </div>
        </Modal.Body>
      </Modal>
      
      :
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="modal-2"
      >
        <div class="center"><div><img src={confirm} alt="Alert about verification" class="prop-img"/></div></div>
        <h1><span>Tu cuenta ya está validada </span></h1><br/>
        <h3> Ahora puedes crear y votar por propuestas de gobernanza urbana en Querétaro.</h3>
        <Modal.Body>
          <div class="void-link">
          <div class="prop-bg"><a href="/Createproposal">
            <img src={prop} class="ribvan"/> 
            <div class="propsub">Crear propuesta</div>
            <div class="propopt">Proponer</div>
          </a></div>
          <div class="prop-bg2"><a href="/ProposalList">
            <img src={vote2} class="ribvan"/>
            <div class="propsub">Propuestas por </div>
            <div class="propopt">Votar</div>
          </a></div>
        </div>
        </Modal.Body>
      </Modal>
    }
    </div>
  );
};

export default QuizAlreadySubmittedModal;
