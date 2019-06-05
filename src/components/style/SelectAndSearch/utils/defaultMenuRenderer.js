'use strict';

import classNames from 'classnames';
import React from 'react';
import {pArray, pFunc, pObject, pString, UI} from "../../../../libs/constants";

const isGroup = (option) => {
    return option && Array.isArray(option.options);
};

const menuRenderer = ({
                          focusedOption,
                          focusOption,
                          inputValue,
                          instancePrefix,
                          onFocus,
                          onOptionRef,
                          onSelect,
                          optionClassName,
                          optionComponent,
                          optionGroupComponent,
                          optionRenderer,
                          options,
                          selectValue,
                          valueArray,
                          valueKey,
                      }) => {
    let OptionGroup = optionGroupComponent;
    let Option = optionComponent;
    let renderLabel = optionRenderer;

    const renderOptions = (optionsSubset) => {
        return optionsSubset.map((option, i) => {
            if (isGroup(option)) {
                let optionGroupClass = classNames({
                    [UI.SELECT_OPTION_GROUP]: true,
                });

                return (
                    <OptionGroup
                        className={optionGroupClass}
                        key={`option-group-${i}`}
                        label={renderLabel(option)}
                        option={option}
                        optionIndex={i}
                    >
                        {renderOptions(option.options)}
                    </OptionGroup>
                );
            } else {
                let isSelected = valueArray && valueArray.indexOf(option) > -1;
                let isFocused = option === focusedOption;
                let optionClass = classNames(optionClassName, {
                    [UI.SELECT_OPTION]: true,
                    [UI.IS_SELECTED]: isSelected,
                    [UI.IS_FOCUSED]: isFocused,
                });

                return (
                    <Option
                        className={optionClass}
                        focusOption={focusOption}
                        inputValue={inputValue}
                        instancePrefix={instancePrefix}
                        isFocused={isFocused}
                        isSelected={isSelected}
                        key={`option-${i}-${option[valueKey]}`}
                        onFocus={onFocus}
                        onSelect={onSelect}
                        option={option}
                        optionIndex={i}
                        ref={ref => {
                            onOptionRef(ref, isFocused);
                        }}
                        selectValue={selectValue}
                    >
                        {renderLabel(option, i)}
                    </Option>
                );
            }
        });
    };

    return renderOptions(options);
};

menuRenderer.propTypes = {
    focusOption: pFunc,
    focusedOption: pObject,
    inputValue: pString,
    instancePrefix: pString,
    onFocus: pFunc,
    onOptionRef: pFunc,
    onSelect: pFunc,
    optionClassName: pString,
    optionComponent: pFunc,
    optionRenderer: pFunc,
     options: pArray,
    selectValue: pFunc,
    valueArray: pArray,
    valueKey: pString
};

export default menuRenderer;
