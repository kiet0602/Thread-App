import { useState } from "react";
import { toast } from "react-toastify";

const usePreviewImg = () => {
  const [imgUrl, setImgUrl] = useState(null);

  const handleImagechange = (e) => {
    const file = e.target.files[0]; // Lấy file đầu tiên từ danh sách các file được chọn.
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader(); // tạo một FileReader và đọc file dưới dạng URL data
      reader.onloadend = () => {
        setImgUrl(reader.result); // result :một thuộc tính của đối tượng FileReader
      };
      reader.readAsDataURL(file);
    } else {
      toast.error(error);
      setImgUrl(null);
    }
  };
  return { handleImagechange, imgUrl, setImgUrl };
};

//handleImagechange: chọn ảnh từ máy , đọc ảnh
//imgUrl: đường link ảnh đã chọn
//setImgUrl: cập nhật ảnh cho đường Link ảnh

export default usePreviewImg;
//Tạo ra usePreviewImg để thay đổi hình ảnh trong các component khác
