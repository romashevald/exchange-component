'use strict';

import classNames from 'classnames';
import React from 'react';
import {
    pBool,
    pFunc,
    pFuncRequired,
    pNode,
    pNumber,
    pObject, pObjectRequired,
    pString,
    pStringRequired,
    UI
} from "../../../../libs/constants";

class Option extends React.Component {

    constructor(props) {
        super(props);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.onFocus = this.onFocus.bind(this);
    }

    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    }

    handleMouseEnter(event) {
        this.onFocus(event);
    }

    handleMouseMove(event) {
        this.onFocus(event);
    }

    handleTouchEnd(event) {
        // Check if the view is being dragged, In this case
        // we don't want to fire the click event (because the user only wants to scroll)
        if (this.dragging) return;

        this.handleMouseDown(event);
    }

    handleTouchMove() {
        // Set a flag that the view is being dragged
        this.dragging = true;
    }

    handleTouchStart() {
        // Set a flag that the view is not being dragged
        this.dragging = false;
    }

    onFocus(event) {
        if (!this.props.isFocused) {
            this.props.onFocus(this.props.option, event);
        }
    }

    render() {
        const {option, instancePrefix, optionIndex} = this.props;
        const className = classNames(this.props.className, option.className);

        return (
            <div className={className}
                 style={option.style}
                 role="option"
                 aria-label={option.label}
                 onMouseDown={this.handleMouseDown}
                 onMouseEnter={this.handleMouseEnter}
                 onMouseMove={this.handleMouseMove}
                 onTouchStart={this.handleTouchStart}
                 onTouchMove={this.handleTouchMove}
                 onTouchEnd={this.handleTouchEnd}
                 id={instancePrefix + UI.OPTION + optionIndex}
                 title={option.title}>
                {this.props.children}
            </div>
        );
    }
}

Option.propTypes = {
    children: pNode,
    className: pString,             // className (based on mouse position)
    instancePrefix: pStringRequired,// unique prefix for the ids (used for aria)
    isFocused: pBool,               // the option is focused
    isSelected: pBool,             // the option is selected
    onFocus: pFunc,                // method to handle mouseEnter on option element
    onSelect: pFunc,               // method to handle click on option element
    onUnfocus: pFunc,              // method to handle mouseLeave on option element
    option: pObjectRequired,         // object that is base for that option
    optionIndex: pNumber           // index of the option, used to generate unique ids for aria
};

export default Option;
