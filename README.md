# Jana's Flowers

Website for Jana's Flowers, Damdinsuren St, Carrefour 1st floor. Runs on GitHub Pages with no build step.

## Files
- `index.html` is the page. You normally never need to touch it.
- `data.json` holds the shop info and the product list. This is the file to edit.
- `images/` holds product photos.

## Add a product
1. Upload the photo into the `images/` folder (Add file > Upload files). Keep the name simple, like `rose-bouquet.jpg`.
2. Open `data.json`, click the pencil icon, and add a block inside `"products": [ ... ]`. Separate blocks with a comma:

```json
{
  "cat": "bouquet",
  "nameMn": "Сарнайн баглаа",
  "nameEn": "Rose bouquet",
  "descMn": "11 ширхэг улаан сарнай",
  "descEn": "11 red roses",
  "price": "45000",
  "status": "",
  "img": "images/rose-bouquet.jpg"
}
```

- `cat` is one of `bouquet`, `plant`, `jewelry`, `tech`.
- `status` is empty for in stock, `made` for made to order, `out` for sold out.
- `price` can be a number like `45000` or text like `25,000₮-өөс`.
- `img` is optional. Without it the card shows a simple icon.
- English fields are optional.

3. Click **Commit changes**. The site updates in about a minute.

## Change shop info
Edit the `"shop"` part of `data.json` (phone, hours, addresses, Facebook link). The Facebook link must start with `https://`.

## Mongolian quick steps (Монголоор)
1. Зургаа `images` хавтас руу оруулна.
2. `data.json` файлыг нээж, харандааны дүрс дээр дарна.
3. Дээрх жишээгээр шинэ бүтээгдэхүүнээ `"products"` дотор нэмнэ. Бүтээгдэхүүн хоорондоо таслалаар тусгаарлагдана.
4. **Commit changes** дарна. Ойролцоогоор минутын дараа сайт шинэчлэгдэнэ.
