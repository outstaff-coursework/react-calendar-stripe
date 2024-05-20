import React from 'react';
import ReactDOM from 'react-dom';
import Stripe from './stripe.js';
import data from './data.json';

ReactDOM.render(
    <Stripe data={data} is_horizontal={true} date={'2024-04-23'} />,
    document.getElementById('root')
);
