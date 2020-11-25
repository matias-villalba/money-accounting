
import {React} from 'react';
import Button from '@material-ui/core/Button';



export default function RefreshButton(props) {

  return (
        <Button onClick={props.onRefresh} color="inherit">Refresh</Button>
  );
}

   