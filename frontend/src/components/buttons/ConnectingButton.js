import { Button, Spinner } from 'react-bootstrap';

const ConnectingButton = () => {
  return (
    <Button variant="secondary" disabled>
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />
      Conectando...
    </Button>
  );
};

export default ConnectingButton;
