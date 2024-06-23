const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const cors = require("cors");
const fs = require("fs");

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      await prisma.hotel.create({
        data: {
          name: row.name,
          dcode: row.dcode,
          dname: row.dname,
          tel: row.tel,
          address: row.address,
          url: row.url,
          room: row.room,
          grade: row.grade,
          name_e: row.name_e,
          lat: row.lat,
          lon: row.lon,
        },
      });
    }

    fs.unlinkSync(file.path); // ลบไฟล์หลังจากใช้งานเสร็จ
    res.send("File uploaded and data imported successfully.");
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file.");
  }
});

app.post("/export", async (req, res) => {
  try {
    const { fields } = req.body;
    if (!fields || fields.length === 0) {
      return res.status(400).send("No fields selected.");
    }

    const hotels = await prisma.hotel.findMany();
    const selectedFields = hotels.map((hotel) => {
      let filteredHotel = {};
      fields.forEach((field) => {
        filteredHotel[field] = hotel[field];
      });
      return filteredHotel;
    });

    const worksheet = xlsx.utils.json_to_sheet(selectedFields);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Hotels");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="exported_data.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).send("Error exporting data.");
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
