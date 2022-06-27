import { useState, useContext, useEffect } from 'react';
import { Form, Button, Row} from 'react-bootstrap';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import IsLoadingModal from '../modals/IsLoadingModal';
import CreateProposalSuccessModal from '../modals/CreateProposalSuccessModal';
import CreateProposalErrorModal from '../modals/CreateProposalErrorModal';
import { LanguageContext } from '../contexts/LanguageContext';
import { GovernorAlphaContext } from '../contexts/GovernorAlphaContext';
import { EthersContext } from '../contexts/EthersContext';
import { TaroContext } from '../contexts/TaroContext';

import prop from '../assets/prop.png';

import Taro from '../contracts/contracts/Taro.sol/Taro.json';
import taroAddress from '../contracts/contracts/Taro/contract-address.json';

import GovernorAlpha from '../contracts/contracts/GovernorAlpha.sol/GovernorAlpha.json';
import governorAlphaAddress from '../contracts/contracts/GovernorAlpha/contract-address.json';

const CreateProposal = () => {
  let [form, setForm] = useState();
  let [loadingModalShow, setLoadingModalShow] = useState();
  let [errorModalShow, setErrorModalShow] = useState();
  let [isConnected, setIsConnected] = useState();
  let [ethersProvider, setEthersProvider] = useState();
  let [signerAddress, setSignerAddress] = useState();
  let [successModalShow, setSuccessModalShow] = useState();

  let [isEnglish] = useContext(LanguageContext);
  let {ethersSigner, setEthersSigner, provider, setProvider} = useContext(EthersContext);
  let {taro, setTaro} = useContext(TaroContext);
  let {governorAlpha, setGovernorAlpha} = useContext(GovernorAlphaContext);
  
  useEffect(() => {
    const main = async () => {
      // setIsMetamaskInstalled(true);
      setIsConnected(false);
      try {
        //detect whether the browser is connected to a provider
        let ethereumProvider = await detectEthereumProvider();
        if (ethereumProvider) {
          // setProvider(ethereumProvider);
          startApp(ethereumProvider);
        } else {
          // setIsMetamaskInstalled(false);
          return;
        };
      } catch (error) {
        console.error(error);
      };

      async function startApp(_ethereumProvider) {
        try {
          //The provider detected by detectEthereumProvider() must be the same as window.ethereum
          if (_ethereumProvider !== window.ethereum) {
            // setIsMetamaskInstalled(false);
            return;
          };

          //Check if a MetaMask account has permission to connect to app
          let metamaskAccount;
          let accounts = await _ethereumProvider.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              metamaskAccount = accounts[0];
              // setCurrentMetaMaskAccount(accounts[0]);
              // setIsMetamaskInstalled(true);
              setIsConnected(true);
            };
          console.log(`metamaskAccount ${metamaskAccount}`);

          //Force the browser to refresh whenever the network chain is changed
          // let chainId = await _ethereumProvider.request({ method: 'eth_chainId' });
          // _ethereumProvider.on('chainChanged', handleChainChanged);
          // console.log('chainId: ', chainId);

          //Create the Ethers.js provider and set it in state
          let _ethersProvider = await new ethers.providers.Web3Provider(_ethereumProvider);
          setEthersProvider(_ethersProvider);
          console.log('_ethersProvider: ', _ethersProvider)
          // make call to contract to check if current user is validated.
          // this may need to be done inside handleOnConnect as well
          // if user is validated, then set isValidated(true)

          if(accounts.length !== 0) {
            let signer = await _ethersProvider.getSigner();
            setEthersSigner(signer);

            const _taro = new ethers.Contract(
              taroAddress.Taro,
              Taro.abi,
              signer
            );
            setTaro(_taro);

            let _signerAddress = await signer.getAddress();
            // console.log("signerAddress: ", _signerAddress);
            setSignerAddress(_signerAddress);

            // let _userBalance = await _taro.balanceOf(signerAddress);
            // console.log('_userBalance in useEffect: ', _userBalance.toString());
            // if(_userBalance) {
            //   setUserBalance(_userBalance.toString());
            // };

            const _governorAlpha = new ethers.Contract(
              governorAlphaAddress.GovernorAlpha,
              GovernorAlpha.abi,
              signer
            );
            setGovernorAlpha(_governorAlpha);
          };
        } catch (error) {
          console.error(error);
        };
      };
    };
    main();
  }, []);

  //Delay function is only for development
  // const delay = () => new Promise(res => setTimeout(res, 2000));

  const handleOnSubmit = async e => {
    e.preventDefault();
    setLoadingModalShow(true);
    console.log('form: ', form);

    try {
      form.budget = ethers.BigNumber.from(form.budget);

      let tx = await governorAlpha.propose(form);
      let txReceipt = await tx.wait(1);
      console.log('form tx: ', txReceipt);
      handleOnLoadingModal();
      setSuccessModalShow(true);
    } catch (e) {
      handleOnLoadingModal();
      setErrorModalShow(true);
    };
  };
  //expiration and requiredTaroToVote are hardcoded because these fields are needed for the smart contract.  The front end is not ready to use these fields.  Later, when the front end is ready, these inputs can be added back into the form inputs.
  const setField = (field, value) => {
    const date = new Date();
    const time = date.getTime();
    let timeAsBigNumber = ethers.BigNumber.from(time);

    setForm({
      ...form,
      [field]: value,
      expiration: 0,
      requiredTaroToVote: 0,
      proposalTime: timeAsBigNumber,
      proposer: signerAddress
    });
  };

  const handleOnChangeTitle = e => {
    setField('title', (e.target.value).toString());
  };

  const handleOnChangeTypeOfAction = e => {
    setField('typeOfAction', (e.target.value).toString());
  };

  const handleOnChangeNeighborhood = e => {
    setField('neighborhood', (e.target.value).toString());
  };

  const handleOnChangePersonInCharge = e => {
    setField('personInCharge', (e.target.value).toString());
  };

  const handleOnChangeDescription = e => {
    setField('description', (e.target.value).toString());
  };

  // const handleOnChangeExpiration = e => {
  //   setField('expiration', ethers.BigNumber.from(e.target.value));
  // };

  const handleOnChangeBudget = e => {
    setField('budget', e.target.value);
  };

  // const handleOnChangeRequiredTaroToVote = e => {
  //   setField('requiredTaroToVote', ethers.BigNumber.from(e.target.value));
  // };

  const handleOnLoadingModal = () => {
    setLoadingModalShow(false);
  };

  const handleOnErrorModal = () => {
    setErrorModalShow(false);
    window.location.reload();
  };

  const handleOnAlreadySubmitted = () => {
    window.location.reload();
  };
  



  return (
    <body id="quiz">
      {isEnglish === 'english'
      ?
      <section id="proposal" class="newprop">
        <h1><span  class="yellow">New Proposal</span></h1>
        <div class="center"><img src={prop} alt="New proposal" class="prop-img"/></div>
        
        <Form autocomplete="off" id="margin">
            <Form.Group as={Row} controlId="formTitle">
            <Form.Label>
              1. Proposal Title
              </Form.Label>
              <Form.Control type="text"
                placeholder="🎯 what needs to be done?"
                onChange={handleOnChangeTitle}/>
            </Form.Group>
  
            <Form.Group as={Row} controlId="formNeighborhood" >
              <Form.Label  >
              2. Location
              </Form.Label>
                <Form.Control as="select" data-live-search="true"
                  onChange={handleOnChangeNeighborhood}>
                  <option disabled selected>📍 Where will the proposal take place</option>
                    <option>City Hall</option>
                    <option>Street</option>
                    <option>Bus Stop</option>
                    <option>Church</option>
                    <option>Police Station</option>
                    <option>Firemen Station</option>
                    <option>University</option>
                    <option>Parks</option>
                    <option>Art Gallery</option>
                    <option>Market</option>
                    <option>Food place</option>
                    <option>Industrial Park</option>
                    <option>Co-working</option>
                    <option>Police Station</option>
                    <option>Web</option>
                    <option>DAO</option>
                </Form.Control>
            </Form.Group>
  
            <Form.Group as={Row} controlId="formTypeOfAction">
            <Form.Label >
              3. Type of activity
              </Form.Label>
              <Form.Control as="select" data-live-search="true"
                onChange={handleOnChangeTypeOfAction}>
                  <option disabled selected>⚙️ Select the type of acitivity</option>
                  <option>Organize a public event</option>
                  <option>Online event</option>
                  <option>Ask for maintainance</option>
                  <option>Ask for a public good</option>
                  <option>Ask for analysis</option>
                  <option>Buy</option>
                  <option>Sell</option>
                  <option>Offer service</option>
                  <option>Offer digital talent</option>
                  <option>Offer industrial talent</option>
                  <option>Create Art</option>
                  <option>Create digital Content</option>
                  <option>Mixed event</option>
              </Form.Control>
            </Form.Group>
  
            <Form.Group as={Row} controlId="formPersonInCharge">    
              <Form.Label  >
                4. DAO Roles
              </Form.Label>
              <Form.Control as="select" class="selectpicker show-tick form-control"
                onChange={handleOnChangePersonInCharge}>
                <option disabled selected>🦸 Who will do the proposal?</option>
                <option>Public Worker / Government</option>
                <option>Citizen</option>
                <option>Cyclist</option>
                <option>Artist</option>
                <option>Pet lover</option>
                <option>Scholar</option>
                <option>Athlete</option>
                <option>Chef</option>
                <option>Industrial Talent</option>
                <option>Merchant</option>
                <option>Digital Creator</option>
                <option>Developer</option>
                
              </Form.Control>
            </Form.Group>
  
            <Form.Group as={Row} controlId="exampleForm.ControlTextarea1">
              <Form.Label>
               5. Description
            </Form.Label>
            <Form.Control className="description" as="textarea"
              type="text" rows={3}
              placeholder="📑Give details about your proposal"
              onChange={handleOnChangeDescription}/>
            </Form.Group>
  
            {/*
            <Form.Group as={Row} controlId="formExpiration">
              <Form.Label  >
                Expiration
              </Form.Label>
              <Form.Control type="text" placeholder="expiration" onChange={handleOnChangeExpiration}/>
            </Form.Group>
            */}
  
            <Form.Group as={Row} controlId="formBudget">
              <Form.Label  >
                6. Budget
              </Form.Label>
              <Form.Control as="select" class="selectpicker show-tick form-control"
                onChange={handleOnChangeBudget}>
                <option disabled selected>💸 Proposal budget range</option>
                <option>Voluntary</option>
                <option>Public Budget</option>  
                <option>DAO Budget</option>
                <option>Dual Budget, Public + DAO</option>
              </Form.Control>
            </Form.Group>
            {/*
            <Form.Group as={Row} controlId="formRequiredTaroToVote">
              <Form.Label  >
                Required TARO to vote
            </Form.Label>
              <Form.Control type="text" placeholder="required TARO to vote" onChange={handleOnChangeRequiredTaroToVote}/>
            </Form.Group>
            */}
            <a class="about-bt" href="#proposal">Check your post before sending</a>
            <div class="center"><div class="quiz-bt" classntype="submit" onClick={handleOnSubmit}>💡 Create Proposal</div></div>
            </Form>
          <IsLoadingModal
            show={loadingModalShow}
            onHide={handleOnLoadingModal}
          />
  
          <CreateProposalErrorModal
            show={errorModalShow}
            onHide={handleOnErrorModal}
          />
  
          <CreateProposalSuccessModal
            show={successModalShow}
            onHide={handleOnAlreadySubmitted}
          />
      </section>
      :
      <section id="proposal" class="newprop">
          <h1><span  class="yellow">Nueva propuesta</span></h1><br/><br/>
        <div class="center"><img src={prop} alt="New proposal" class="prop-img"/></div>
          
        <Form autocomplete="off" id="margin">
        <Form.Group as={Row} controlId="formTitle">
          <Form.Label>
            1. Título de la propuesta
            </Form.Label>
            <Form.Control type="text"
              placeholder="🎯 Dale un nombre a tu propuesta"
              onChange={handleOnChangeTitle}/>
          </Form.Group>

          <Form.Group as={Row} controlId="formNeighborhood" >
            <Form.Label  >
            2. Ubicación
            </Form.Label>
              <Form.Control as="select" data-live-search="true"
                onChange={handleOnChangeNeighborhood}>
                <option disabled selected>📍 ¿Dónde se llevará a cabo la propuesta?</option>
                    <option>Ayuntamiento</option>
                    <option>Calle</option>
                    <option>Parada de autobús</option>
                    <option>Iglesia</option>
                    <option>Estación de Policía</option>
                    <option>Cuarto de Bomberos</option>
                    <option>Universidad</option>
                    <option>Parques</option>
                    <option>Galería de Arte</option>
                    <option>Mercado</option>
                    <option>lugar de comida</option>
                    <option>Parque Industrial</option>
                    <option>Coworking</option>
                    <option>Estación de Policía</option>
                    <option>Web</option>
                    <option>DAO</option>
              </Form.Control>
          </Form.Group>

          <Form.Group as={Row} controlId="formTypeOfAction">
          <Form.Label >
            3. Tipo de actividad
            </Form.Label>
            <Form.Control as="select" data-live-search="true"
              onChange={handleOnChangeTypeOfAction}>
                <option disabled selected>⚙️ Selecciona un tipo de actividad</option>
                <option>Organizar un evento público</option>
                 <option>Evento en línea</option>
                 <option>Solicitar mantenimiento</option>
                 <option>Pide un bien público</option>
                 <option>Solicitar análisis</option>
                 <option>Comprar</option>
                 <option>Vender</option>
                 <option>Ofrecer servicio</option>
                 <option>Ofrecer talento digital</option>
                 <option>Ofrecer talento industrial</option>
                 <option>Crear Arte</option>
                 <option>Crear contenido digital</option>
                 <option>Evento mixto</option>
            </Form.Control>
          </Form.Group>

          <Form.Group as={Row} controlId="formPersonInCharge">    
            <Form.Label  >
              4. Roles DAO
            </Form.Label>
            <Form.Control as="select" class="selectpicker show-tick form-control"
              onChange={handleOnChangePersonInCharge}>
              <option disabled selected>🦸 ¿Que rol debe realizar la propuesa?</option>
              <option>Trabajador Público / Gobierno</option>
              <option>Ciudadano</option>
              <option>Ciclista</option>
              <option>Artista</option>
              <option>Amante de las mascotas</option>
              <option>Académico</option>
              <option>Atleta</option>
              <option>Cocinero</option>
              <option>Talento Industrial</option>
              <option>Comerciante</option>
              <option>Creador digital</option>
              <option>Desarrollador</option>
              
            </Form.Control>
          </Form.Group>

          <Form.Group as={Row} controlId="exampleForm.ControlTextarea1">
            <Form.Label>
             5. Descripción
          </Form.Label>
          <Form.Control className="description" as="textarea"
            type="text" rows={3}
            placeholder="📑 Describe a detalle tu propuesta"
            onChange={handleOnChangeDescription}/>
          </Form.Group>

          {/*
          <Form.Group as={Row} controlId="formExpiration">
            <Form.Label  >
              Expiration
            </Form.Label>
            <Form.Control type="text" placeholder="expiration" onChange={handleOnChangeExpiration}/>
          </Form.Group>
          */}

          <Form.Group as={Row} controlId="formBudget">
            <Form.Label  >
              6. Presupuesto
            </Form.Label>
            <Form.Control as="select" class="selectpicker show-tick form-control"
              onChange={handleOnChangeBudget}>
              <option disabled selected>💸 Elige el origen de los fondos</option>
              <option>Voluntario</option>
              <option>Presupuesto Público</option>
              <option>Presupuesto DAO</option>
              <option>Presupuesto Dual, Público + DAO</option>
            </Form.Control>
          </Form.Group>
            {/*
            <Form.Group as={Row} controlId="formRequiredTaroToVote">
              <Form.Label  >
                Required TARO to vote
            </Form.Label>
              <Form.Control type="text" placeholder="required TARO to vote" onChange={handleOnChangeRequiredTaroToVote}/>
            </Form.Group>
            */}
            <a class="about-bt" href="#proposal">Revisa tu puesta antes de enviar</a>
              <div class="center"><div class="quiz-bt" classntype="submit" onClick={handleOnSubmit}>💡 Enviar propuesta</div></div>
            </Form>
          <IsLoadingModal
            show={loadingModalShow}
            onHide={handleOnLoadingModal}
          />
 
          <CreateProposalErrorModal
            show={errorModalShow}
            onHide={handleOnErrorModal}
          />
 
          <CreateProposalSuccessModal
            show={successModalShow}
            onHide={handleOnAlreadySubmitted}
          />
        </section>
        }
      </body>
      );
    };
export default CreateProposal;
