'use strict';
import PropTypes from 'prop-types';


export const UPDATE_PERIOD_300000 = 300000;


export const pFunc = PropTypes.func;
export const pFuncRequired = PropTypes.func.isRequired;

export const pNumber = PropTypes.number;
export const pNumberRequired = PropTypes.number.isRequired;

export const pBool = PropTypes.bool;
export const pBoolRequired = PropTypes.bool.isRequired;

export const pArray = PropTypes.array;
export const pArrayRequired = PropTypes.array.isRequired;

export const pObject = PropTypes.object;
export const pObjectRequired = PropTypes.object.isRequired;

export const pString = PropTypes.string;
export const pStringRequired = PropTypes.string.isRequired;

export const pAny = PropTypes.any;
export const pAnyRequired = PropTypes.any.isRequired;

export const pNode = PropTypes.node;
export const pNodeRequired = PropTypes.node.isRequired;

export const pNumberOrString = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
export const pNumberOrStringRequired = PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired;

export const stringOrNode = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
]);

export const UI = {
    APP: 'app'
    , HEADER: 'header'
    , FLEX_BOX: 'flex-box'
    , BLOCK_FORM: 'block-from'
    , INPUT_WITH_HEADER: 'input-with-header'
    , TEXT_HEADER: 'text-header'
    , NUM_INPUT: 'num-input'
    , SELECT_FORM: 'select-form'
    , REACT_SELECT: 'react-select-'
    , VALUE_ITEM: '-value-item'

    , LIST: '-list'
    , OPTION: '-option-'
    , VALUE: '-value'
    , HAS_VALUE: 'has-value'

    , ARIA_ACTIVEDESCENDANT: 'aria-activedescendant'
    , ARIA_DESCRIBEDBY: 'aria-describedby'
    , ARIA_EXPANDED: 'aria-expanded'
    , ARIA_HASPOPUP: 'aria-haspopup'
    , ARIA_LABEL: 'aria-label'
    , ARIA_LABELLEDBY: 'aria-labelledby'
    , ARIA_OWNS: 'aria-owns'

    , SELECT_INPUT: 'Select-input'
    , SELECT_ARROW_ZONE: 'Select-arrow-zone'
    , SELECT_ARROW: 'Select-arrow'
    , SELECT_NO_RESULTS: 'Select-noresults'
    , SELECT_MENU_OUTER: 'Select-menu-outer'
    , SELECT_MENU: 'Select-menu'
    , SELECT_SINGLE: 'Select--single'
    , SELECT_CONTROL: 'Select-control'
    , SELECT_MULTI_VALUE_WRAPPER: 'Select-multi-value-wrapper'
    , SELECT_OPTION_GROUP: 'Select-option-group'
    , SELECT_OPTION_GROUP_LABEL: 'Select-option-group-label'
    , SELECT_OPTION: 'Select-option'
    , SELECT_VALUE: 'Select-value'
    , SELECT: 'Select'

    , IS_FOCUSED: 'is-focused'
    , IS_LOADING: 'is-loading'
    , IS_OPEN: 'is-open'
    , IS_PSEUDO_FOCUSED: 'is-pseudo-focused'
    , IS_SEARCHABLE: 'is-searchable'
    , IS_SELECTED: 'is-selected'

};

export const handleFunctionsSelectAndEdit = [
    'focusOption',
    'getOptionLabel',
    'handleInputBlur',
    'handleInputChange',
    'handleInputFocus',
    'handleInputValueChange',
    'handleKeyDown',
    'handleMenuScroll',
    'handleMouseDown',
    'handleMouseDownOnArrow',
    'handleMouseDownOnMenu',
    'handleTouchEnd',
    'handleTouchMove',
    'handleTouchOutside',
    'handleTouchStart',
    'handleValueClick',
    'onOptionRef',
    'selectValue',
];