import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

function App() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);

    try {
      const response = await axios.post(
        "http://localhost:8888/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("File uploaded successfully!");
      console.log("File uploaded successfully:", response.data);
    } catch (error) {
      setMessage("Error uploading file.");
      console.error("Error uploading file:", error);
    }
  };

  const handleExport = async (data) => {
    try {
      const response = await axios.post("http://localhost:8888/export", data, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "exported_data.xlsx");
      document.body.appendChild(link);
      link.click();
      setMessage("File exported successfully!");
    } catch (error) {
      setMessage("Error exporting file.");
      console.error("Error exporting file:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-4 bg-white rounded shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="file" {...register("file")} />
          <button
            type="submit"
            className="mt-2 p-2 bg-blue-600 text-white rounded"
          >
            Upload
          </button>
        </form>
        <form onSubmit={handleSubmit(handleExport)}>
          <div className="mt-4">
            <label>
              <input type="checkbox" {...register("fields")} value="name" />
              Name
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="dcode" />
              Dcode
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="dname" />
              Dname
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="tel" />
              Tel
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="address" />
              Address
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="url" />
              URL
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="room" />
              Room
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="grade" />
              Grade
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="name_e" />
              Name (English)
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="lat" />
              Latitude
            </label>
            <label>
              <input type="checkbox" {...register("fields")} value="lon" />
              Longitude
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 p-2 bg-green-600 text-white rounded"
          >
            Export
          </button>
        </form>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
    </div>
  );
}

export default App;
