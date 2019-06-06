'use strict';

import React from 'react';
import {findDOMNode} from 'react-dom';

import Dropdown from './components/Dropdown';
import Option from './components/Option';
import OptionGroup from './components/OptionGroup';
import Value from './components/Value';

import defaultFilterOptions from "./utils/defaultFilterOptions";
import defaultArrowRenderer from "./utils/defaultArrowRenderer";
import defaultMenuRenderer from "./utils/defaultMenuRenderer";
import {pAny, pArray, pBool, pFunc, pNumber, pObject, pString, stringOrNode} from "../../../libs/constants";
import {classnames, clone, isGroup, shouldShowValue, stringifyValue} from "../../../libs/utils";
import {handleFunctionsSelectAndEdit, UI} from '../../../libs/constants'

let instanceId = 1;

class Select extends React.Component {
    constructor(props) {
        super(props);

        handleFunctionsSelectAndEdit.forEach((fn) => this[fn] = this[fn].bind(this));

        this.state = {
            inputValue: '',
            isFocused: false,
            isOpen: false,
            isPseudoFocused: false,
        };
    }

    componentWillMount() {
        this._flatOptions = this.flattenOptions(this.props.options);
        this._instancePrefix = UI.REACT_SELECT + (this.props.instanceId || ++instanceId) + '-';
    }

    componentDidMount() {
        if (typeof this.props.autofocus !== 'undefined' && typeof console !== 'undefined') {
            console.warn('Warning: The autofocus prop has changed to autoFocus, support will be removed after react-select@1.0');
        }
        if (this.props.autoFocus || this.props.autofocus) {
            this.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.options !== this.props.options) {
            this._flatOptions = this.flattenOptions(nextProps.options);
        }

        if (!nextProps.isOpen && this.props.isOpen) {
            this.closeMenu();
        } else if (nextProps.isOpen && !this.props.isOpen) {
            this.setState({isOpen: true});
        }


        if (this.state.inputValue && this.props.value !== nextProps.value && nextProps.onSelectResetsInput) {
            this.setState({inputValue: this.handleInputValueChange('')});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // focus to the selected option
        if (this.menu && this.focused && this.state.isOpen && !this.hasScrolledToOption) {
            const focusedOptionNode = findDOMNode(this.focused);
            let menuNode = findDOMNode(this.menu);

            const scrollTop = menuNode.scrollTop;
            const scrollBottom = scrollTop + menuNode.offsetHeight;
            const optionTop = focusedOptionNode.offsetTop;
            const optionBottom = optionTop + focusedOptionNode.offsetHeight;

            if (scrollTop > optionTop || scrollBottom < optionBottom) {
                menuNode.scrollTop = focusedOptionNode.offsetTop;
            }

            // We still set hasScrolledToOption to true even if we didn't
            // actually need to scroll, as we've still confirmed that the
            // option is in view.
            this.hasScrolledToOption = true;
        } else if (!this.state.isOpen) {
            this.hasScrolledToOption = false;
        }

        if (this._scrollToFocusedOptionOnUpdate && this.focused && this.menu) {
            this._scrollToFocusedOptionOnUpdate = false;
            const focusedDOM = findDOMNode(this.focused);
            let menuDOM = findDOMNode(this.menu);
            const focusedRect = focusedDOM.getBoundingClientRect();
            const menuRect = menuDOM.getBoundingClientRect();
            if (focusedRect.bottom > menuRect.bottom) {
                menuDOM.scrollTop = (focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight);
            } else if (focusedRect.top < menuRect.top) {
                menuDOM.scrollTop = focusedDOM.offsetTop;
            }
        }
        if (this.props.scrollMenuIntoView && this.menuContainer) {
            const menuContainerRect = this.menuContainer.getBoundingClientRect();
            if (window.innerHeight < menuContainerRect.bottom + this.props.menuBuffer) {
                window.scrollBy(0, menuContainerRect.bottom + this.props.menuBuffer - window.innerHeight);
            }
        }

        if (prevState.isOpen !== this.state.isOpen) {
            this.toggleTouchOutsideEvent(this.state.isOpen);
            const handler = this.state.isOpen ? this.props.onOpen : this.props.onClose;
            handler && handler();
        }
    }

    componentWillUnmount() {
        this.toggleTouchOutsideEvent(false);
    }

    toggleTouchOutsideEvent(enabled) {
        if (enabled) {
            if (!document.addEventListener && document.attachEvent) {
                document.attachEvent('ontouchstart', this.handleTouchOutside);
            } else {
                document.addEventListener('touchstart', this.handleTouchOutside);
            }
        } else {
            if (!document.removeEventListener && document.detachEvent) {
                document.detachEvent('ontouchstart', this.handleTouchOutside);
            } else {
                document.removeEventListener('touchstart', this.handleTouchOutside);
            }
        }
    }

    handleTouchOutside(event) {
        // handle touch outside on ios to dismiss menu
        if (this.wrapper && !this.wrapper.contains(event.target)) {
            this.closeMenu();
        }
    }

    focus() {
        if (!this.input) return;
        this.input.focus();
    }

    blurInput() {
        if (!this.input) return;
        this.input.blur();
    }

    handleTouchMove() {
        // Set a flag that the view is being dragged
        this.dragging = true;
    }

    handleTouchStart() {
        // Set a flag that the view is not being dragged
        this.dragging = false;
    }

    handleTouchEnd(event) {
        // Check if the view is being dragged, In this case
        // we don't want to fire the click event (because the user only wants to scroll)
        if (this.dragging) return;

        // Fire the mouse events
        this.handleMouseDown(event);
    }

    handleMouseDown(event) {
        // if the event was triggered by a mousedown and not the primary
        if ((event.type === 'mousedown' && event.button !== 0)) {
            return;
        }

        if (event.target.tagName === 'INPUT') {
            if (!this.state.isFocused) {
                this._openAfterFocus = this.props.openOnClick;
                this.focus();
            } else if (!this.state.isOpen) {
                this.setState({
                    isOpen: true,
                    isPseudoFocused: false,
                });
            }

            return;
        }

        // prevent default event handlers
        event.preventDefault();

        // for the non-searchable select, toggle the menu
        if (!this.props.searchable) {
            // This code means that if a select is searchable, onClick the options menu will not appear, only on subsequent click will it open.
            this.focus();
            return this.setState({
                isOpen: !this.state.isOpen,
            });
        }

        if (this.state.isFocused) {
            // On iOS, we can get into a state where we think the input is focused but it isn't really,
            // since iOS ignores programmatic calls to input.focus() that weren't triggered by a click event.
            // Call focus() again here to be safe.
            this.focus();

            let toOpen = true;

            // if the input is focused, ensure the menu is open
            this.setState({
                isOpen: toOpen,
                isPseudoFocused: false,
                focusedOption: null,
            });
        } else {
            // otherwise, focus the input and open the menu
            this._openAfterFocus = this.props.openOnClick;
            this.focus();
            this.setState({focusedOption: null});
        }
    }

    handleMouseDownOnArrow(event) {
        // if the event was triggered by a mousedown and not the primary
        if ((event.type === 'mousedown' && event.button !== 0)) {
            return;
        }

        if (this.state.isOpen) {
            // prevent default event handlers
            event.stopPropagation();
            event.preventDefault();
            // close the menu
            this.closeMenu();
        } else {
            // If the menu isn't open, let the event bubble to the main handleMouseDown
            this.setState({
                isOpen: true
            });
        }
    }

    handleMouseDownOnMenu(event) {
        // if the event was triggered by a mousedown and not the primary
        if ((event.type === 'mousedown' && event.button !== 0)) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        this._openAfterFocus = true;
        this.focus();
    }

    closeMenu() {
        if (this.props.onCloseResetsInput) {
            this.setState({
                inputValue: this.handleInputValueChange(''),
                isOpen: false,
                isPseudoFocused: this.state.isFocused
            });
        } else {
            this.setState({
                isOpen: false,
                isPseudoFocused: this.state.isFocused
            });
        }
        this.hasScrolledToOption = false;
    }

    handleInputFocus(event) {
        let toOpen = this.state.isOpen || this._openAfterFocus || this.props.openOnFocus;

        if (this.props.onFocus) {
            this.props.onFocus(event);
        }

        this.setState({
            isFocused: true,
            isOpen: !!toOpen,
        });

        this._openAfterFocus = false;
    }

    handleInputBlur(event) {
        // The check for menu.contains(activeElement) is necessary to prevent IE11's scrollbar from closing the menu in certain contexts.
        if (this.menu && (this.menu === document.activeElement || this.menu.contains(document.activeElement))) {
            this.focus();
            return;
        }

        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
        let onBlurredState = {
            isFocused: false,
            isOpen: false,
            isPseudoFocused: false,
        };
        if (this.props.onBlurResetsInput) {
            onBlurredState.inputValue = this.handleInputValueChange('');
        }
        this.setState(onBlurredState);
    }

    handleInputChange(event) {
        let newInputValue = event.target.value;

        if (this.state.inputValue !== event.target.value) {
            newInputValue = this.handleInputValueChange(newInputValue);
        }

        this.setState({
            inputValue: newInputValue,
            isOpen: true,
            isPseudoFocused: false,
        });
    }

    handleInputValueChange(newValue) {
        if (this.props.onInputChange) {
            let nextState = this.props.onInputChange(newValue);
            // Note: != used deliberately here to catch undefined and null
            if (nextState !== null && typeof nextState !== 'object') {
                newValue = '' + nextState;
            }
        }
        return newValue;
    }

    handleKeyDown(event) {
        if (typeof this.props.onInputKeyDown === 'function') {
            this.props.onInputKeyDown(event);
            if (event.defaultPrevented) {
                return;
            }
        }

        switch (event.keyCode) {
            case 13: // enter
                event.preventDefault();
                event.stopPropagation();
                if (this.state.isOpen) {
                    this.selectFocusedOption();
                } else {
                    this.focusNextOption();
                }
                break;
            case 38: // up
                event.preventDefault();
                this.focusPreviousOption();
                break;
            case 40: // down
                event.preventDefault();
                this.focusNextOption();
                break;
            case 33: // page up
                event.preventDefault();
                this.focusPageUpOption();
                break;
            case 34: // page down
                event.preventDefault();
                this.focusPageDownOption();
                break;
            case 35: // end key
                if (event.shiftKey) {
                    break;
                }
                event.preventDefault();
                this.focusEndOption();
                break;
            case 36: // home key
                if (event.shiftKey) {
                    break;
                }
                event.preventDefault();
                this.focusStartOption();
                break;
        }
    }

    handleValueClick(option, event) {
        if (!this.props.onValueClick) return;
        this.props.onValueClick(option, event);
    }

    handleMenuScroll(event) {
        if (!this.props.onMenuScrollToBottom) return;
        let {target} = event;
        if (target.scrollHeight > target.offsetHeight && (target.scrollHeight - target.offsetHeight - target.scrollTop) <= 0) {
            this.props.onMenuScrollToBottom();
        }
    }

    getOptionLabel(op) {
        return op[this.props.labelKey];
    }

    /**
     * Turns a value into an array from the given options
     * @param {String|Number|Array} value        - the value of the select input
     * @param {Object}        nextProps    - optionally specify the nextProps so the returned array uses the latest configuration
     * @returns    {Array}    the value of the select represented in an array
     */
    getValueArray(value, nextProps = undefined) {
        /** support optionally passing in the `nextProps` so `componentWillReceiveProps` updates will function as expected */
        const props = typeof nextProps === 'object' ? nextProps : this.props;
        const expandedValue = this.expandValue(value, props);
        return expandedValue ? [expandedValue] : [];
    }

    /**
     * Retrieve a value from the given options and valueKey
     * @param    {String|Number|Array}    value    - the selected value(s)
     * @param    {Object}        props    - the Select component's props (or nextProps)
     */
    expandValue(value, props) {
        const valueType = typeof value;
        if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') return value;
        let {labelKey, renderInvalidValues, valueKey} = props;
        let options = this._flatOptions;
        if (!options) return;
        for (let i = 0; i < options.length; i++) {
            if (String(options[i][valueKey]) === String(value)) return options[i];
        }

        // no matching option, return an invalid option if renderInvalidValues is enabled
        if (renderInvalidValues) {
            this._invalidOptions = this._invalidOptions || {};
            this._invalidOptions[value] = this._invalidOptions[value] || {
                invalid: true,
                [labelKey]: value,
                [valueKey]: value
            };
            return this._invalidOptions[value];
        }
    }

    setValue(value) {
        if (this.props.autoBlur) {
            this.blurInput();
        }
        if (this.props.simpleValue && value) {
            value = value[this.props.valueKey];
        }
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    selectValue(value) {
        // NOTE: we actually add/set the value in a callback to make sure the
        // input value is empty to avoid styling issues in Chrome
        if (this.props.closeOnSelect) {
            this.hasScrolledToOption = false;
        }
        const updatedValue = this.props.onSelectResetsInput ? '' : this.state.inputValue;
        this.setState({
            inputValue: this.handleInputValueChange(updatedValue),
            isOpen: !this.props.closeOnSelect,
            isPseudoFocused: this.state.isFocused,
        }, () => {
            this.setValue(value);
        });
    }

    focusOption(option) {
        this.setState({
            focusedOption: option
        });
    }

    focusNextOption() {
        this.focusAdjacentOption('next');
    }

    focusPreviousOption() {
        this.focusAdjacentOption('previous');
    }

    focusPageUpOption() {
        this.focusAdjacentOption('page_up');
    }

    focusPageDownOption() {
        this.focusAdjacentOption('page_down');
    }

    focusStartOption() {
        this.focusAdjacentOption('start');
    }

    focusEndOption() {
        this.focusAdjacentOption('end');
    }

    focusAdjacentOption(dir) {
        const options = this._visibleOptions
            .map((option, index) => ({option, index}));
        this._scrollToFocusedOptionOnUpdate = true;
        if (!this.state.isOpen) {
            const newState = {
                focusedOption: this._focusedOption || (options.length ? options[dir === 'next' ? 0 : options.length - 1].option : null),
                isOpen: true,
            };
            if (this.props.onSelectResetsInput) {
                newState.inputValue = '';
            }
            this.setState(newState);
            return;
        }
        if (!options.length) return;
        let focusedIndex = -1;
        for (let i = 0; i < options.length; i++) {
            if (this._focusedOption === options[i].option) {
                focusedIndex = i;
                break;
            }
        }
        if (dir === 'next' && focusedIndex !== -1) {
            focusedIndex = (focusedIndex + 1) % options.length;
        } else if (dir === 'previous') {
            if (focusedIndex > 0) {
                focusedIndex = focusedIndex - 1;
            } else {
                focusedIndex = options.length - 1;
            }
        } else if (dir === 'start') {
            focusedIndex = 0;
        } else if (dir === 'end') {
            focusedIndex = options.length - 1;
        } else if (dir === 'page_up') {
            const potentialIndex = focusedIndex - this.props.pageSize;
            if (potentialIndex < 0) {
                focusedIndex = 0;
            } else {
                focusedIndex = potentialIndex;
            }
        } else if (dir === 'page_down') {
            const potentialIndex = focusedIndex + this.props.pageSize;
            if (potentialIndex > options.length - 1) {
                focusedIndex = options.length - 1;
            } else {
                focusedIndex = potentialIndex;
            }
        }

        if (focusedIndex === -1) {
            focusedIndex = 0;
        }

        this.setState({
            focusedIndex: options[focusedIndex].index,
            focusedOption: options[focusedIndex].option
        });
    }

    selectFocusedOption() {
        if (this._focusedOption) {
            return this.selectValue(this._focusedOption);
        }
    }

    renderValue(valueArray, isOpen) {
        let renderLabel = this.props.valueRenderer || this.getOptionLabel;
        let ValueComponent = this.props.valueComponent;
        if (!valueArray.length) {
            return null;
        }
        let onClick = this.props.onValueClick ? this.handleValueClick : null;
        if (shouldShowValue(this.state, this.props)) {
            if (isOpen) onClick = null;
            return (
                <ValueComponent
                    id={this._instancePrefix + UI.VALUE_ITEM}
                    instancePrefix={this._instancePrefix}
                    onClick={onClick}
                    placeholder={this.props.placeholder}
                    value={valueArray[0]}
                >
                    {renderLabel(valueArray[0])}
                </ValueComponent>
            );
        }
    }

    renderInput(valueArray, focusedOptionIndex) {
        const className = classnames(UI.SELECT_INPUT, this.props.inputProps.className);
        const isOpen = this.state.isOpen;

        const ariaOwns = classnames({
            [this._instancePrefix + UI.LIST]: isOpen,
        });

        let value = this.state.inputValue;
        if (value && !this.props.onSelectResetsInput) {
            // it hides input value when it is not focused and was not reset on select
            value = '';
        }

        const inputProps = {
            ...this.props.inputProps,
            [UI.ARIA_ACTIVEDESCENDANT]: isOpen ? this._instancePrefix + UI.OPTION + focusedOptionIndex : this._instancePrefix + UI.VALUE,
            [UI.ARIA_DESCRIBEDBY]: this.props[UI.ARIA_DESCRIBEDBY],
            [UI.ARIA_EXPANDED]: '' + isOpen,
            [UI.ARIA_HASPOPUP]: '' + isOpen,
            [UI.ARIA_LABEL]: this.props[UI.ARIA_LABEL],
            [UI.ARIA_LABELLEDBY]: this.props[UI.ARIA_LABELLEDBY],
            [UI.ARIA_OWNS]: ariaOwns,
            className: className,
            onBlur: this.handleInputBlur,
            onChange: this.handleInputChange,
            onFocus: this.handleInputFocus,
            role: 'combobox',
            tabIndex: this.props.tabIndex,
            value,
        };

        if (this.props.inputRenderer) {
            return this.props.inputRenderer(inputProps);
        }

        if (!this.props.searchable) {
            const {...divProps} = this.props.inputProps;

            const ariaOwns = classnames({
                [this._instancePrefix + UI.LIST]: isOpen,
            });
            return (

                <div
                    {...divProps}
                    aria-expanded={isOpen}
                    aria-owns={ariaOwns}
                    aria-activedescendant={isOpen ? this._instancePrefix + UI.OPTION + focusedOptionIndex : this._instancePrefix + '-value'}
                    aria-label={this.props[UI.ARIA_LABEL]}
                    aria-labelledby={this.props[UI.ARIA_LABELLEDBY]}
                    className={className}
                    onBlur={this.handleInputBlur}
                    onFocus={this.handleInputFocus}
                    ref={ref => this.input = ref}
                    role="combobox"
                    style={{border: 0, width: 1, display: 'inline-block'}}
                    tabIndex={this.props.tabIndex || 0}
                />
            );
        }

        return (
            <div className={className} key="input-wrap">
                <input id={this.props.id} {...inputProps} />
            </div>
        );
    }

    renderArrow() {
        if (!this.props.arrowRenderer) return;

        const onMouseDown = this.handleMouseDownOnArrow;
        const isOpen = this.state.isOpen;
        const arrow = this.props.arrowRenderer({onMouseDown, isOpen});

        if (!arrow) {
            return null;
        }

        return (
            <span
                className={UI.SELECT_ARROW_ZONE}
                onMouseDown={onMouseDown}
            >
				{arrow}
			</span>
        );
    }

    filterFlatOptions(excludeOptions) {
        const filterValue = this.state.inputValue;
        const flatOptions = this._flatOptions;
        if (this.props.filterOptions) {

            return this.props.filterOptions(
                flatOptions,
                filterValue,
                excludeOptions,
                {
                    filterOption: this.props.filterOption,
                    ignoreCase: this.props.ignoreCase,
                    labelKey: this.props.labelKey,
                    matchPos: this.props.matchPos,
                    matchProp: this.props.matchProp,
                    valueKey: this.props.valueKey,
                }
            );
        } else {
            return flatOptions;
        }
    }

    flattenOptions(options, group) {
        if (!options) return [];
        let flatOptions = [];
        for (let i = 0; i < options.length; i++) {
            // We clone each option with a pointer to its parent group for efficient unflattening
            const optionCopy = clone(options[i]);
            if (group) {
                optionCopy.group = group;
            }
            if (isGroup(optionCopy)) {
                flatOptions = flatOptions.concat(this.flattenOptions(optionCopy.options, optionCopy));
                optionCopy.options = [];
            } else {
                flatOptions.push(optionCopy);
            }
        }
        return flatOptions;
    }

    unflattenOptions(flatOptions) {
        const groupedOptions = [];
        let parent, child;

        // Remove all ancestor groups from the tree
        flatOptions.forEach((option) => {
            option.isInTree = false;
            parent = option.group;
            while (parent) {
                if (parent.isInTree) {
                    parent.options = [];
                    parent.isInTree = false;
                }
                parent = parent.group;
            }
        });

        // Now reconstruct the options tree
        flatOptions.forEach((option) => {
            child = option;
            parent = child.group;
            while (parent) {
                if (!child.isInTree) {
                    parent.options.push(child);
                    child.isInTree = true;
                }

                child = parent;
                parent = child.group;
            }
            if (!child.isInTree) {
                groupedOptions.push(child);
                child.isInTree = true;
            }
        });

        // Remove the isInTree flag we added
        flatOptions.forEach((option) => {
            delete option.isInTree;
        });

        return groupedOptions;
    }

    onOptionRef(ref, isFocused) {
        if (isFocused) {
            this.focused = ref;
        }
    }

    renderMenu(options, valueArray, focusedOption) {
        if (options && options.length) {
            return this.props.menuRenderer({
                focusedOption,
                focusOption: this.focusOption,
                inputValue: this.state.inputValue,
                instancePrefix: this._instancePrefix,
                labelKey: this.props.labelKey,
                onFocus: this.focusOption,
                onOptionRef: this.onOptionRef,
                onSelect: this.selectValue,
                optionClassName: this.props.optionClassName,
                optionComponent: this.props.optionComponent,
                optionGroupComponent: this.props.optionGroupComponent,
                optionRenderer: this.props.optionRenderer || this.getOptionLabel,
                options,
                selectValue: this.selectValue,
                valueArray,
                valueKey: this.props.valueKey,
            });
        } else if (this.props.noResultsText) {
            return (
                <div className={UI.SELECT_NO_RESULTS}>
                    {this.props.noResultsText}
                </div>
            );
        } else {
            return null;
        }
    }

    renderHiddenField(valueArray) {
        if (!this.props.name) return;
        return valueArray.map((item, index) => (
            <input
                key={'hidden.' + index}
                name={this.props.name}
                ref={'value' + index}
                type="hidden"
                value={stringifyValue(item[this.props.valueKey])}
            />
        ));
    }

    getFocusableOptionIndex(selectedOption) {
        const options = this._visibleOptions;
        if (!options.length) return null;

        const valueKey = this.props.valueKey;
        let focusedOption = this.state.focusedOption || selectedOption;
        if (focusedOption) {
            let focusedOptionIndex = -1;
            options.some((option, index) => {
                const isOptionEqual = option[valueKey] === focusedOption[valueKey];
                if (isOptionEqual) {
                    focusedOptionIndex = index;
                }
                return isOptionEqual;
            });
            if (focusedOptionIndex !== -1) {
                return focusedOptionIndex;
            }
        }

        return null;
    }

    renderOuter(options, valueArray, focusedOption) {
        let Dropdown = this.props.dropdownComponent;
        let menu = this.renderMenu(options, valueArray, focusedOption);
        if (!menu) {
            return null;
        }

        return (
            <Dropdown>
                <div ref={ref => this.menuContainer = ref} className={UI.SELECT_MENU_OUTER}
                     style={this.props.menuContainerStyle}>
                    <div
                        className=""
                        id={this._instancePrefix + UI.LIST}
                        onMouseDown={this.handleMouseDownOnMenu}
                        onScroll={this.handleMenuScroll}
                        ref={ref => this.menu = ref}
                        role="listbox"
                        style={this.props.menuStyle}
                        tabIndex={-1}
                    >
                        {menu}
                    </div>
                </div>
            </Dropdown>
        );
    }

    render() {
        let valueArray = this.getValueArray(this.props.value);
        this._visibleOptions = this.filterFlatOptions(null);
        let options = this.unflattenOptions(this._visibleOptions);
        let isOpen = typeof this.props.isOpen === 'boolean' ? this.props.isOpen : this.state.isOpen;
        if (!options.length && valueArray.length && !this.state.inputValue) isOpen = false;
        const focusedOptionIndex = this.getFocusableOptionIndex(valueArray[0]);

        let focusedOption = null;
        if (focusedOptionIndex !== null) {
            focusedOption = this._focusedOption = this._visibleOptions[focusedOptionIndex];
        } else {
            focusedOption = this._focusedOption = null;
        }
        let className = classnames(UI.SELECT, this.props.className, {
            [UI.HAS_VALUE]: valueArray.length,
            [UI.IS_FOCUSED]: this.state.isFocused,
            [UI.IS_LOADING]: this.props.isLoading,
            [UI.IS_OPEN]: isOpen,
            [UI.IS_PSEUDO_FOCUSED]: this.state.isPseudoFocused,
            [UI.IS_SEARCHABLE]: this.props.searchable,
            [UI.SELECT_SINGLE]: true,
        });

        return (
            <div ref={ref => this.wrapper = ref}
                 className={className}
                 style={this.props.wrapperStyle}>
                {this.renderHiddenField(valueArray)}
                <div ref={ref => this.control = ref}
                     className={UI.SELECT_CONTROL}
                     onKeyDown={this.handleKeyDown}
                     onMouseDown={this.handleMouseDown}
                     onTouchEnd={this.handleTouchEnd}
                     onTouchMove={this.handleTouchMove}
                     onTouchStart={this.handleTouchStart}
                     style={this.props.style}
                >
					<span className={UI.SELECT_MULTI_VALUE_WRAPPER}
                          id={this._instancePrefix + UI.VALUE}>
						{this.renderValue(valueArray, isOpen)}
                        {isOpen ? this.renderInput(valueArray, focusedOptionIndex) : null}
					</span>
                    {this.renderArrow(isOpen, valueArray, focusedOptionIndex)}
                </div>
                {isOpen ? this.renderOuter(options, valueArray, focusedOption) : null}
            </div>
        );
    }
}

Select.propTypes = {
    [UI.ARIA_DESCRIBEDBY]: pString, // HTML ID(s) of element(s) that should be used to describe this input (for assistive tech)
    [UI.ARIA_LABEL]: pString,       // Aria label (for assistive tech)
    [UI.ARIA_LABELLEDBY]: pString,  // HTML ID of an element that should be used as the label (for assistive tech)
    arrowRenderer: pFunc,        // Create drop-down caret element
    autoBlur: pBool,             // automatically blur the component when an option is selected
    autoFocus: pBool,            // autofocus the component on mount
    autofocus: pBool,            // deprecated; use autoFocus instead
    className: pString,          // className for the outer element
    closeOnSelect: pBool,        // whether to close the menu when a value is selected
    dropdownComponent: pFunc,    // dropdown component to render the menu in
    filterOption: pFunc,         // method to filter a single option (option, filterString)
    filterOptions: pAny,         // boolean to enable default filtering or function to filter the options array ([options], filterString, [values])
    id: pString, 				 // html id to set on the input element for accessibility or tests
    ignoreCase: pBool,           // whether to perform case-insensitive filtering
    inputProps: pObject,         // custom attributes for the Input
    inputRenderer: pFunc,        // returns a custom input component
    instanceId: pString,         // set the components instanceId
    isLoading: pBool,            // whether the Select is loading externally or not (such as options being loaded)
    isOpen: pBool,               // whether the Select dropdown menu is open or not
    labelKey: pString,           // path of the label value in option objects
    matchPos: pString,           // (any|start) match the start or entire string when filtering
    matchProp: pString,          // (any|label|value) which option property to filter on
    menuBuffer: pNumber,         // optional buffer (in px) between the bottom of the viewport and the bottom of the menu
    menuContainerStyle: pObject, // optional style to apply to the menu container
    menuRenderer: pFunc,         // renders a custom menu with options
    menuStyle: pObject,          // optional style to apply to the menu
    name: pString,               // generates a hidden <input /> tag with this field name for html forms
    noResultsText: stringOrNode, // placeholder displayed when there are no matching search results
    onBlur: pFunc,               // onBlur handler: function (event) {}
    onBlurResetsInput: pBool,    // whether input is cleared on blur
    onChange: pFunc,             // onChange handler: function (newValue) {}
    onClose: pFunc,              // fires when the menu is closed
    onCloseResetsInput: pBool,   // whether input is cleared when menu is closed through the arrow
    onFocus: pFunc,              // onFocus handler: function (event) {}
    onInputChange: pFunc,        // onInputChange handler: function (inputValue) {}
    onInputKeyDown: pFunc,       // input keyDown handler: function (event) {}
    onMenuScrollToBottom: pFunc, // fires when the menu is scrolled to the bottom; can be used to paginate options
    onOpen: pFunc,               // fires when the menu is opened
    onSelectResetsInput: pBool,  // whether input is cleared on select (works only for multiselect)
    onValueClick: pFunc,         // onClick handler for value labels: function (value, event) {}
    openOnClick: pBool,           // boolean to control opening the menu when the control is clicked
    openOnFocus: pBool,          // always open options menu on focus
    optionClassName: pString,    // additional class(es) to apply to the <Option /> elements
    optionComponent: pFunc,      // option component to render in dropdown
    optionGroupComponent: pFunc, // option group component to render in dropdown
    optionRenderer: pFunc,       // optionRenderer: function (option) {}
    options: pArray,             // array of options
    pageSize: pNumber,           // number of entries to page when using page up/down keys
    placeholder: stringOrNode,   // field placeholder, displayed when there's no value
    renderInvalidValues: pBool,  // boolean to enable rendering values that do not match any options
    resetValue: pAny,            // value to use when you clear the control
    scrollMenuIntoView: pBool,   // boolean to enable the viewport to shift so that the full menu fully visible when engaged
    searchable: pBool,           // whether to enable searching feature or not
    simpleValue: pBool,          // pass the value to onChange as a simple value (legacy pre 1.0 mode), defaults to false
    style: pObject,              // optional style to apply to the control
    tabIndex: pString,           // optional tab index of the control
    tabSelectsValue: pBool,      // whether to treat tabbing out while focused to be value selection
    value: pAny,                 // initial field value
    valueComponent: pFunc,       // value component to render
    valueKey: pString,           // path of the label value in option objects
    valueRenderer: pFunc,        // valueRenderer: function (option) {}
    wrapperStyle: pObject,       // optional style to apply to the component wrapper
};

Select.defaultProps = {
    arrowRenderer: defaultArrowRenderer,
    closeOnSelect: true,
    dropdownComponent: Dropdown,
    filterOptions: defaultFilterOptions,
    ignoreCase: true,
    inputProps: {},
    isLoading: false,
    labelKey: 'label',
    matchPos: 'any',
    matchProp: 'any',
    menuBuffer: 0,
    menuRenderer: defaultMenuRenderer,
    noResultsText: 'No results found',
    onBlurResetsInput: true,
    onCloseResetsInput: true,
    onSelectResetsInput: true,
    openOnClick: true,
    optionComponent: Option,
    optionGroupComponent: OptionGroup,
    pageSize: 5,
    placeholder: 'Select...',
    scrollMenuIntoView: true,
    searchable: true,
    simpleValue: false,
    tabSelectsValue: true,
    valueComponent: Value,
    valueKey: 'value',
};

export default Select;
