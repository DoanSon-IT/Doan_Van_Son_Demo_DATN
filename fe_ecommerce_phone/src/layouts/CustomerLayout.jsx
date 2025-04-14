import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnouncementBar from "../components/layout/AnnouncementBar";
import ScrollToTop from "../components/common/ScrollToTop";
import SmartChatCenter from "../components/common/SmartChatCenter";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import RandomDiscount from "../components/common/RandomDiscount";

const CustomerLayout = () => {

    const { auth } = useContext(AppContext);

    return (
        <div className="min-h-screen bg-white w-full flex flex-col">
            <AnnouncementBar />
            <Header />
            <main className="flex w-full flex-grow items-center justify-center">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>
            <Footer />
            <div className="fixed bottom-24 left-5 z-[100]">
                <RandomDiscount />
            </div>
            <div className="fixed bottom-24 right-5 z-[101]">
                <SmartChatCenter userId={auth?.id || -1} />
            </div>
            <div className="fixed bottom-4 right-5 z-[90]">
                <ScrollToTop />
            </div>
        </div>
    );
};

export default CustomerLayout;