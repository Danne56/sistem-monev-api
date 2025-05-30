const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Hilangkan aksen
    .replace(/[\u0300-\u036f]/g, "") // Hilangkan karakter non-ASCII
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "") // Hapus karakter aneh
    .replace(/\-\-+/g, "-") // Ganti multiple - jadi satu
    .replace(/^-+/, "") // Hapus - di awal
    .replace(/-+$/, ""); // Hapus - di akhir

module.exports = slugify;