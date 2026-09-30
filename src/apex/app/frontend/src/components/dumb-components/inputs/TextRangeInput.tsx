import React, {FC, useState} from "react";
import {InputWrapper} from "@components/dumb-components/inputs/InputWrapper.tsx";

export type TextInputProps = {
    label: string,
    id?: string,
    type?: string,
    tooltip?: string
    placeholder?: string,
    onChange?: (min:number, max:number) => void,
    required?: boolean,
    className?: string,
}

export const TextRangeInput: FC<TextInputProps> = ({
                                                       type,
                                                       className,
                                                       required,
                                                       onChange,
                                                       label,
                                                       id,
                                                       tooltip,
                                                       placeholder,
                                                   }) => {

    const [value, setValue] = useState(undefined);

    const handleChange = (e) => {
        const value = e.target.value;
        let min, max;

        if (value === '') {
            min = undefined;
            max = undefined;
        }
        else if (value.includes('-')) {
            const [start, end] = value.split('-');
            min = start ? parseInt(start, 10) : undefined;
            max = end ? parseInt(end, 10) : undefined;
        } else {
            min = max = parseInt(value, 10);
        }

        onChange(min, max);
        setValue(value);
    }

    return (
        <>
            <InputWrapper label={label} id={id} required={required} tooltip={tooltip} className={className}>
                <input
                    type={type ? type : "text"}
                    id={id}
                    className="block w-full border-0 bg-white ring-1 ring-inset ring-gray-400 focus:ring-accent-dark rounded-md bg-transparent py-2 px-3 placeholder-gray-500"
                    placeholder={placeholder}
                    onChange={handleChange}
                    value={value}
                />
            </InputWrapper>
        </>
    )
};
