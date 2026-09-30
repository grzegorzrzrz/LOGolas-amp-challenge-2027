import React, { FC } from 'react';
import clsx from 'clsx';
import {InputWrapper} from "@components/dumb-components/inputs/InputWrapper.tsx";
import Select  from "react-select";
import {appTexts} from "../../../texts";

export type SelectProps = {
    label: string,
    options: { value: any, label: string }[],
    id?: string,
    tooltip?: string
    placeholder?: string,
    onChange?: any,
    required?: boolean,
    className?: string,
}

export const AppSelect: FC<SelectProps> = ({
                                            className,
                                            options,
                                            required,
                                            onChange,
                                            label,
                                            id,
                                            tooltip,
                                            placeholder = appTexts.commonTexts.select}) => {
    return (
        <InputWrapper label={label} id={id} required={required} tooltip={tooltip} className={className}>
            <Select options={options} isMulti={true} placeholder={placeholder} onChange={onChange}
                    styles={{control:
                    (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: "#9CA3AF"
                    }),}} />
        </InputWrapper>
    )
};
