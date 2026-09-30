import React, {FC, useState, useEffect, useRef} from 'react';
import {useScrollPosition} from "@n8tb1t/use-scroll-position";
import clsx from "clsx";
import {Logo} from "./Logo";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";
import {appTexts} from "../../texts";

export type NavbarProps = {}

export const Navbar: FC<NavbarProps> = ({}) => {
    const [scrolled, setScrolled] = useState(0);

    useScrollPosition(
        ({currPos}) => {
            currPos.y >= 0 ?
                setScrolled(0) :
                setScrolled(1)
        },
        [scrolled]
    )

    const [isOpenBurger, setOpenBurger] = useState(false);
    const toggleBurger = () => {
        setOpenBurger(!isOpenBurger);
    }

    const hideBurger = () => {
        setOpenBurger(false);
    };

    const navbarTexts = appTexts.navbarTexts;
    const pages = [
        {path: "/home", title: navbarTexts.menuItems.home},
        {path: "/database/apexdb", title: navbarTexts.menuItems.apexDb},
        {path: "/stats", title: navbarTexts.menuItems.stats},
        {path: "/publications", title: navbarTexts.menuItems.publications},
        {path: "/about", title: navbarTexts.menuItems.about}
    ];

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenBurger(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="p-0 m-0 z-50 w-full">
            <nav className={clsx("flex items-center w-full transition-all duration-150 fill-current pl-4 pt-2")}>
                <div className="max-w-md flex items-center w-full">
                {/* <div className="flex items-center mb-5 mt-3">
                    <Link to="/" className="text-3xl flex items-center">
                        <Logo className="mb-[-5px] h-20 w-20"/> 
                        
                    </Link>
                </div> */}
                
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={toggleBurger} 
                        className="flex items-center space-x-1 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-200 border border-transparent hover:border-gray-300 hover:shadow-sm p-2"
                    >
                        <span className={clsx("text-primary-500 text-2xl")}>{navbarTexts.brandName}</span>
                        <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    {isOpenBurger && (
                        <div className="absolute w-auto whitespace-nowrap left-0 mt-2 border rounded-md bg-gray-200 z-50">
                            {pages.map(page => (
                                <Link 
                                    to={page.path} 
                                    key={page.path} 
                                    className="block px-4 py-2 text-gray-800 hover:bg-gray-300"
                                    onClick={hideBurger}
                                >
                                    {page.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                </div>
            </nav>
        </div>
    )
};
