'use strict';

import React from 'react';
import {pFunc, UI} from "../../../../libs/constants";

const arrowRenderer = ({onMouseDown}) => {
    return (
        <span
            className={UI.SELECT_ARROW}
            onMouseDown={onMouseDown}
        />
    );
};

arrowRenderer.propTypes = {
    onMouseDown: pFunc,
};

export default arrowRenderer;
