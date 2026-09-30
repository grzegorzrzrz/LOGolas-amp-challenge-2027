import React, {FC} from 'react';
import {Navbar} from "./Navbar";
import {Outlet} from "react-router-dom";
import {Footer} from "./Footer";
import ScrollToTop from "@components/ScrollToTop.tsx";
import CookieBanner from "./CookieBanner";

export type GlobalLayoutProps = {}

export const GlobalLayout: FC<GlobalLayoutProps> = ({}) => {
    return (
        <>
            <Navbar/>
            <div className="">
                <Outlet/>
            </div>
            <Footer className="mt-auto"/>
            <ScrollToTop />
            <CookieBanner />
        </>
    )
};
