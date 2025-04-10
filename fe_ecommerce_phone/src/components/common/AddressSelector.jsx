import React, { useEffect, useState } from "react";
import axios from "axios";

const AddressSelector = ({ onChange }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [houseDetail, setHouseDetail] = useState("");

    const [showDropdown, setShowDropdown] = useState(false);
    const [fullAddress, setFullAddress] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=1").then((res) => {
            setProvinces(res.data);
        });
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`).then((res) => {
                setDistricts(res.data.districts);
                setWards([]);
                setSelectedDistrict("");
                setSelectedWard("");
            });
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`).then((res) => {
                setWards(res.data.wards);
                setSelectedWard("");
            });
        }
    }, [selectedDistrict]);

    const validate = () => {
        const errs = {};
        if (!selectedProvince) errs.province = "Vui lòng chọn tỉnh/thành";
        if (!selectedDistrict) errs.district = "Vui lòng chọn quận/huyện";
        if (!selectedWard) errs.ward = "Vui lòng chọn phường/xã";
        if (!houseDetail.trim()) errs.house = "Vui lòng nhập số nhà, ngõ...";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleConfirm = () => {
        if (!validate()) return;

        const provinceName = provinces.find(p => p.code === +selectedProvince)?.name;
        const districtName = districts.find(d => d.code === +selectedDistrict)?.name;
        const wardName = wards.find(w => w.code === +selectedWard)?.name;

        const final = `${houseDetail}, ${wardName}, ${districtName}, ${provinceName}`;
        setFullAddress(final);
        onChange(final);
        setShowDropdown(false);
    };

    const handleClick = () => {
        setShowDropdown((prev) => !prev);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700">Địa chỉ</label>
            <input
                type="text"
                readOnly
                value={fullAddress}
                onClick={handleClick}
                placeholder="Nhấn để chọn địa chỉ"
                className={`w-full px-3 py-2 border ${Object.keys(errors).length > 0 ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
            />
            {Object.values(errors)[0] && (
                <p className="text-sm text-red-600 mt-1">{Object.values(errors)[0]}</p>
            )}

            {showDropdown && (
                <div className="mt-4 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tỉnh / Thành phố</label>
                        <select
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            className={`w-full px-3 py-2 border ${errors.province ? "border-red-500" : "border-gray-300"
                                } rounded-md focus:outline-none`}
                        >
                            <option value="">-- Chọn tỉnh --</option>
                            {provinces.map((p) => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                        </select>
                        {errors.province && (
                            <p className="text-sm text-red-600">{errors.province}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quận / Huyện</label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedProvince}
                            className={`w-full px-3 py-2 border ${errors.district ? "border-red-500" : "border-gray-300"
                                } rounded-md focus:outline-none`}
                        >
                            <option value="">-- Chọn huyện --</option>
                            {districts.map((d) => (
                                <option key={d.code} value={d.code}>{d.name}</option>
                            ))}
                        </select>
                        {errors.district && (
                            <p className="text-sm text-red-600">{errors.district}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phường / Xã</label>
                        <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            disabled={!selectedDistrict}
                            className={`w-full px-3 py-2 border ${errors.ward ? "border-red-500" : "border-gray-300"
                                } rounded-md focus:outline-none`}
                        >
                            <option value="">-- Chọn xã --</option>
                            {wards.map((w) => (
                                <option key={w.code} value={w.code}>{w.name}</option>
                            ))}
                        </select>
                        {errors.ward && (
                            <p className="text-sm text-red-600">{errors.ward}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số nhà, ngõ, đường...</label>
                        <input
                            type="text"
                            value={houseDetail}
                            onChange={(e) => setHouseDetail(e.target.value)}
                            className={`w-full px-3 py-2 border ${errors.house ? "border-red-500" : "border-gray-300"
                                } rounded-md focus:outline-none`}
                            placeholder="VD: Số 12, Ngõ 5"
                        />
                        {errors.house && (
                            <p className="text-sm text-red-600">{errors.house}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Xác nhận địa chỉ
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDropdown(false)}
                            className="text-black hover:underline text-sm"
                        >
                            Đóng chọn địa chỉ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressSelector;
