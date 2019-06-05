'use strict';

import classNames from 'classnames';
import React from 'react';
import {pFunc, pNode, pObjectRequired, pString, UI} from "../../../../libs/constants";

class Value extends React.Component {
    handleMouseDown = (event) => {
        if (event.type === 'mousedown' && event.button !== 0) {
            return;
        }
        if (this.props.onClick) {
            event.stopPropagation();
            this.props.onClick(this.props.value, event);
            return;
        }
        if (this.props.value.href) {
            event.stopPropagation();
        }
    };

    handleTouchEndRemove = (event) => {
        // Check if the view is being dragged, In this case
        // we don't want to fire the click event (because the user only wants to scroll)
        if (this.dragging) return;
    };

    handleTouchMove = () => {
        // Set a flag that the view is being dragged
        this.dragging = true;
    };

    handleTouchStart = () => {
        // Set a flag that the view is not being dragged
        this.dragging = false;
    };

    renderLabel() {
        let className = 'Select-value-label';
        return this.props.onClick || this.props.value.href ? (
            <a className={className} href={this.props.value.href} target={this.props.value.target}
               onMouseDown={this.handleMouseDown} onTouchEnd={this.handleMouseDown}>
                {this.props.children}
            </a>
        ) : (
            <span className={className} role="option" aria-selected="true" id={this.props.id}>
				{this.props.children}
			</span>
        );
    }

    render() {
        return (
            <div className={classNames([UI.SELECT_VALUE], this.props.value.className)}
                 style={this.props.value.style}
                 title={this.props.value.title}
            >
                {this.renderLabel()}
            </div>
        );
    }
}

Value.propTypes = {
    children: pNode,
    id: pString,                   // Unique id for the value - used for aria
    onClick: pFunc,                // method to handle click on value label
    value: pObjectRequired     // the option object for this value
};

export default Value;
