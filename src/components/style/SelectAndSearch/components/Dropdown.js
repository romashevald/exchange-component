'use strict';

import React from 'react';
import {pNode} from "../../../../libs/constants";

class Dropdown extends React.Component {
  render () {
    // This component adds no markup
    return this.props.children;
  }
}

Dropdown.propTypes = {
  children: pNode
};

export default Dropdown;
