import { Button } from 'react-bootstrap';

const ConnectButton = ({handleOnConnect}) => {
  return (
    <Button onClick={handleOnConnect}>Conectar Wallet</Button>
  );
};

export default ConnectButton;
