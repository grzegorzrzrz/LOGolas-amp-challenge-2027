import React, {FC} from "react";
import clsx from "clsx";
import {InputWrapper} from "@components/dumb-components/inputs/InputWrapper.tsx";

export type TextInputProps = {
    label: string,
    id?: string,
    type?: string,
    tooltip?: string
    placeholder?: string,
    onChange?: any,
    required?: boolean,
    className?: string,
    value?: string
}

export const TextInput: FC<TextInputProps> = ({
                                                  type,
                                                  className,
                                                  required,
                                                  onChange,
                                                  label,
                                                  id,
                                                  tooltip,
                                                  placeholder,
                                                  value
                                              }) => {
    return (
        <>
            <InputWrapper label={label} id={id} required={required} tooltip={tooltip} className={className}>
                <input
                    type={type ? type : "text"}
                    id={id}
                    className="block w-full border-0 ring-1 ring-inset bg-white ring-gray-400 rounded-md bg-transparent py-2 px-3 placeholder-gray-500"
                    placeholder={placeholder}
                    onChange={onChange}
                    value={value}
                />
            </InputWrapper>
        </>
    )
};
