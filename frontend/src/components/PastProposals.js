import { useContext, useEffect, useState } from 'react';
import {Link} from "react-router-dom";
import {ListGroup, Button} from 'react-bootstrap';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import ApprovedProposal from './ApprovedProposal';
import RejectedProposal from './RejectedProposal';
import { LanguageContext } from '../contexts/LanguageContext';
import { ValidationRequiredContext } from '../contexts/ValidationRequiredContext';
import { GovernorAlphaContext } from '../contexts/GovernorAlphaContext';
import ValidationRequired from '../alerts/ValidationRequired';
import { EthersContext } from '../contexts/EthersContext';

import Voto from '../contracts/contracts/Voto.sol/Voto.json';
import votoAddress from '../contracts/contracts/Voto/contract-address.json';

import GovernorAlpha from '../contracts/contracts/GovernorAlpha.sol/GovernorAlpha.json';
import governorAlphaAddress from '../contracts/contracts/GovernorAlpha/contract-address.json';

import prop from '../assets/prop.svg';
import rprop from '../assets/rprop.png';
import aprop from '../assets/aprop.png';
import vote from '../assets/vote.svg';
import vote2 from '../assets/vote2.svg';
import reward from '../assets/TAROrew.png';
import verify from '../assets/verify.svg';



const PastProposals = () => {
  let [voto, setVoto] = useState();
  let [signerAddress, setSignerAddress] = useState();
  let [approvedProposals, setApprovedProposals] = useState([]);
  let [rejectedProposals, setRejectedProposals] = useState([]);
  let [showApproved, setShowApproved] = useState(true);

  let {isValidated} = useContext(ValidationRequiredContext);
  let [isEnglish] = useContext(LanguageContext);
  let {governorAlpha} = useContext(GovernorAlphaContext);
  let {provider} = useContext(EthersContext);

  useEffect(() => {
    const main = async () => {
      // setIsMetamaskInstalled(true);
      // setIsConnected(false);
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
              // setIsConnected(true);
            };
          console.log(`metamaskAccount ${metamaskAccount}`);

          //Force the browser to refresh whenever the network chain is changed
          // let chainId = await _ethereumProvider.request({ method: 'eth_chainId' });
          // _ethereumProvider.on('chainChanged', handleChainChanged);
          // console.log('chainId: ', chainId);

          //Create the Ethers.js provider and set it in state
          let _ethersProvider = await new ethers.providers.Web3Provider(_ethereumProvider);
          // setEthersProvider(_ethersProvider);
          console.log('_ethersProvider: ', _ethersProvider)
          // make call to contract to check if current user is validated.
          // this may need to be done inside handleOnConnect as well
          // if user is validated, then set isValidated(true)

          if(accounts.length !== 0) {
            let signer = await _ethersProvider.getSigner();
            // setEthersSigner(signer);

            const _voto = new ethers.Contract(
              votoAddress.Voto,
              Voto.abi,
              signer
            );
            setVoto(_voto);

            let _signerAddress = await signer.getAddress();
            // console.log("signerAddress: ", signerAddress);
            setSignerAddress(_signerAddress);

            // let _userBalance = await _voto.balanceOf(signerAddress);
            // console.log('_userBalance in useEffect: ', _userBalance.toString());
            // if(_userBalance) {
            //   setUserBalance(_userBalance.toString());
            // };

            const _governorAlpha = new ethers.Contract(
              governorAlphaAddress.GovernorAlpha,
              GovernorAlpha.abi,
              signer
            );
            // setGovernorAlpha(_governorAlpha);

            let _isValidated = await _governorAlpha.getValidityStatus();
            // console.log(_isValidated);

            let proposalCount = await _governorAlpha.proposalCount();
            proposalCount = +proposalCount;

            if(proposalCount > 0) {
              let pastProposals = [];
              let proposal, currentTimeInSeconds;
              for(let i = 1; i <= proposalCount; i++) {
                proposal = await _governorAlpha.proposals(ethers.BigNumber.from(i));
                currentTimeInSeconds = Date.parse(new Date(Date.now())) / 1000;
                // currentBlockNumber = await _ethersProvider.getBlockNumber();
                // console.log('block number: ', currentBlockNumber)
                // console.log('proposal:', proposal.endBlock.toNumber());
                // console.log('forVotes: ', proposal.forVotes.toString());
                // console.log('againstVotes: ', proposal.againstVotes.toString());
                // console.log('proposal: ', proposal);
                // console.log('eb: ', proposal.endBlock.toNumber());
                // console.log('currentBlockNumber: ', currentBlockNumber);


                if(proposal.endBlock.toNumber() <= currentTimeInSeconds) {
                  let _proposalTime = proposal.startBlock.toString();
                  let dateObject = new Date(_proposalTime * 1000);
                  let year = dateObject.toLocaleString("en-US", {year: 'numeric'});
                  let month = dateObject.toLocaleString("en-US", {month: 'numeric'});
                  let day = dateObject.toLocaleString("en-US", {day: 'numeric'});

                  pastProposals.push({
                    title: proposal[9][0],
                    typeOfAction: proposal[9][1],
                    neighborhood: proposal[9][2],
                    personInCharge: proposal[9][3],
                    description: proposal[9][4],
                    expiration: proposal[9][5].toString(),
                    budget: proposal[9][6].toString(),
                    requiredVotoToVote: proposal[9][7].toString(),
                    forVotes: proposal.forVotes.div('1000000000000000000').toString(),
                    againstVotes: proposal.againstVotes.div('1000000000000000000').toString(),
                    id: proposal.id.toString(),
                    proposer: proposal.proposer.toString(),
                    proposalYear: year,
                    proposalMonth: month,
                    proposalDay: day
                  });
                };
              };
              // console.log('pastProposals: ', pastProposals)
              pastProposals.reverse();

              let approved = [];
              for(let i = 0; i < pastProposals.length; i++) {
                if(pastProposals[i].forVotes > pastProposals[i].againstVotes) {
                  approved.push(pastProposals[i]);
                };
              };
              setApprovedProposals(approved);

              let rejected = []
              for(let i = 0; i < pastProposals.length; i++) {
                if(pastProposals[i].forVotes <= pastProposals[i].againstVotes) {
                  rejected.push(pastProposals[i]);
                };
              };
              setRejectedProposals(rejected);
            };
          };
        } catch (error) {
          console.error(error);
        };
      };
    };
    main();
  }, []);

  const approvedList = approvedProposals.map((proposal, i) => {
    return (
      <div key={i}>
        <ApprovedProposal
          title={proposal.title}
          typeOfAction={proposal.typeOfAction}
          neighborhood={proposal.neighborhood}
          personInCharge={proposal.personInCharge}
          description={proposal.description}
          expiration={proposal.expiration}
          budget={proposal.budget}
          votoToVote={proposal.votoToVote}
          forVotes={proposal.forVotes}
          againstVotes={proposal.againstVotes}
          id={proposal.id}
          proposer={proposal.proposer}
          proposalYear={proposal.proposalYear}
          proposalMonth={proposal.proposalMonth}
          proposalDay={proposal.proposalDay}
        />
      </div>
    )
  });

  const rejectedList = rejectedProposals.map((proposal, i) => {
    return (
      <div key={i}>
        <RejectedProposal
          title={proposal.title}
          typeOfAction={proposal.typeOfAction}
          neighborhood={proposal.neighborhood}
          personInCharge={proposal.personInCharge}
          description={proposal.description}
          expiration={proposal.expiration}
          budget={proposal.budget}
          votoToVote={proposal.votoToVote}
          forVotes={proposal.forVotes}
          againstVotes={proposal.againstVotes}
          id={proposal.id}
          proposer={proposal.proposer}
          proposalYear={proposal.proposalYear}
          proposalMonth={proposal.proposalMonth}
          proposalDay={proposal.proposalDay}
        />
      </div>
    )
  });

  const handleOnApprove = () => {
    setShowApproved(!showApproved);
  };

  return (
    <div>
        {isEnglish === 'english'
        ?
        <section class="proplist">
          <br/><br/>
          <h1><span class="yellow">Past Proposals</span></h1><br/><br/>
          <div class="center"><img src={vote} id="CityDAO" alt="Querévoto DAO" class="prop-img"/></div>
        
          <div id="margin" className= "props">
            <div>
              {showApproved
                ?
                <div className="space">
                  {approvedList.length > 0
                    ?
                    <div className="space">
                        <div class="void-link">
                          <div class="prop-bgh"><a onClick={handleOnApprove}>
                            <img src={rprop} class="ribvan"/> 
                            <div class="propsub">Switch proposals</div>
                            <div class="propopt">Rejected </div>
                            </a></div>
                            <div class="prop-bg2"><a href="/ProposalList#vote">
                            <img src={vote2} class="ribvan"/>
                            <div class="propsub">Avalilable proposals</div>
                            <div class="propopt">Vote</div></a>
                          </div>
                        </div><br/>
                      <h1 class="aproposal1">Approved Proposals</h1>
                      {approvedList}
                      <div class="void-link">
                        <div class="prop-bgh"><a onClick={handleOnApprove}>
                          <img src={rprop} class="ribvan"/> 
                          <div class="propsub">Switch proposals</div>
                          <div class="propopt">Rejected </div>
                        </a></div>
                        <div class="prop-bg"><a href="/createProposal">
                          <img src={prop} class="ribvan"/> 
                          <div class="propsub">Create a proposal</div>
                          <div class="propopt">Propose</div>
                        </a></div>
                      </div>
                    </div>
                    :
                    <div className="void">                
                    <h1><span class="red">There are no approved proposals</span></h1><br/>
                      <div class="floating">
                        <h3>Create a proposal or validate your account to participate.
                          You can also view the proposal history or learn more before you start.
                        </h3>
                      </div>
                      <div class="void-link">
                        <div class="bg-grid3"><a onClick={handleOnApprove}>
                        <img src={rprop} class="ribvan"/> 
                          <div class="propsub">Switch proposals</div>
                          <div class="propopt">Rejected </div>
                        </a></div>
                        <div class="bg-grid3"><a href="/createProposal">
                          <img src={prop} class="ribvan"/> 
                          <div class="propsub">Create a proposal</div>
                          <div class="propopt">Propose</div>
                        </a></div>
                      </div>
                    </div>
                  }
                </div>
                :
                <div>
                  {rejectedList.length > 0
                    ?
                    <div className="space">
                      <div class="void-link">
                        <div class="prop-bgh"><a onClick={handleOnApprove}>
                          <img src={aprop} class="ribvan"/> 
                          <div class="propsub">Switch proposals</div>
                          <div class="propopt">Approved </div>
                          </a></div>
                          <div class="prop-bg2"><a href="/ProposalList#vote">
                          <img src={vote2} class="ribvan"/>
                          <div class="propsub">Avalilable proposals</div>
                          <div class="propopt">Vote</div></a>
                        </div>
                      </div><br/>
                      <h2 class="rproposal1">Rejected Proposals</h2>
                      {rejectedList}
                      <div class="void-link">
                        <div class="prop-bgh"><a onClick={handleOnApprove}>
                          <img src={aprop} class="ribvan"/> 
                          <div class="propsub">Switch proposals</div>
                          <div class="propopt">Approved </div>
                        </a></div>
                        <div class="prop-bg"><a href="/createProposal">
                          <img src={prop} class="ribvan"/> 
                          <div class="propsub">Create proposal</div>
                          <div class="propopt">Propose</div>
                        </a></div>
                      </div>
                    </div>
                    :
                    <div className="void">                
                    <h1><span class="red">There are no rejected proposals</span></h1><br/>
                      <div class="floating">
                        <h3>Create a proposal or validate your account to participate.
                          You can also view the proposal history or learn more before you start.
                        </h3>
                      </div>
                      <div class="void-link">
                        <div class="bg-grid3"><a onClick={handleOnApprove}>
                        <img src={aprop} class="ribvan"/> 
                          <div class="propsub">Switch proposals</div>
                          <div class="propopt">Approved </div>
                        </a></div>
                        <div class="bg-grid3"><a href="/createProposal">
                          <img src={prop} class="ribvan"/> 
                          <div class="propsub">Create a proposal</div>
                          <div class="propopt">Propose</div>
                        </a></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </section>      
        :
        <section class="proplist">
          <br/><br/>
          
          <div id="margin" className= "props">
            <h2><span class="yellow">Propuestas anteriores</span></h2>
            <div>
              {showApproved
                ?
                <div className="space">
                  {approvedList.length > 0
                    ?
                    <div className="space">
                      <div class="history">
                        <div class="void-link">
                          <a onClick={handleOnApprove} >
                            <div class="hudH">
                              <div class="propsub">Ver propuestas</div>
                              <div class="propopt">Rechazadas </div>
                            </div>
                          </a>
                          <a href="/ProposalList#vote">
                            <div  class="hudH2">
                              <div class="propsub">Propuestas disponibles</div>
                              <div class="propopt">Vota</div>
                            </div>
                          </a>
                        </div>
                      </div>
                       <div id="margin"><h1 class="aproposal1">Propuestas aprobadas</h1>{approvedList}</div>
                    </div>
                    :
                    <div className="void">                
                    <h1><span class="red">No hay propuestas aprobadas</span></h1><br/>
                      <div class="history">
                        <div class="void-link">
                          <a onClick={handleOnApprove} >
                            <div class="hudH">
                              <div class="propsub">Ver propuestas</div>
                              <div class="propopt">Rechazadas </div>
                            </div>
                          </a>
                          <a href="/ProposalList#vote">
                            <div  class="hudH2">
                              <div class="propsub">Propuestas disponibles</div>
                              <div class="propopt">Vota</div>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                </div>
                :
                <div>
                  {rejectedList.length > 0
                    ?
                  <div className="space">
                    <div class="history">
                      <div class="void-link">
                        <a onClick={handleOnApprove} >
                          <div class="hudH">
                            <div class="propsub">Ver propuestas</div>
                            <div class="propopt">Rechazadas </div>
                          </div>
                        </a>
                        <a href="/ProposalList#vote">
                          <div  class="hudH2">
                            <div class="propsub">Propuestas disponibles</div>
                            <div class="propopt">Vota</div>
                          </div>
                        </a>
                      </div>
                    </div>
                    <h1 class="rproposal1">Propuestas rechazadas</h1>
                    {rejectedList}
                  </div>
                    :
                    <div>                
                    <h2><span class="red">No hay propuestas rechazadas</span></h2><br/>
                      <div class="history">
                      <div class="void-link">
                        <a onClick={handleOnApprove} class="hudH">
                          <div >
                            <div class="propsub">Ver propuestas</div>
                            <div class="propopt">Aprobadas </div>
                          </div>
                        </a>
                        <a href="/ProposalList#vote" class="hudH2">
                          <div >
                            <div class="propsub">Propuestas disponibles</div>
                            <div class="propopt">Vota</div>
                          </div>
                        </a>
                      </div>
                    </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </section>
       
      }
      </div>
  );
};

 export default PastProposals;
