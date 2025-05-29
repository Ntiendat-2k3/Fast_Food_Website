import basket_icon from "./basket_icon.png";
import logo from "./logo.png";
import header_img from "./header_img.png";
import search_icon from "./search_icon.png";

import add_icon_white from "./add_icon_white.png";
import add_icon_green from "./add_icon_green.png";
import remove_icon_red from "./remove_icon_red.png";
import app_store from "./app_store.png";
import play_store from "./play_store.png";
import linkedin_icon from "./linkedin_icon.png";
import facebook_icon from "./facebook_icon.png";
import twitter_icon from "./twitter_icon.png";
import cross_icon from "./cross_icon.png";
import selector_icon from "./selector_icon.png";
import rating_starts from "./rating_starts.png";
import profile_icon from "./profile_icon.png";
import bag_icon from "./bag_icon.png";
import logout_icon from "./logout_icon.png";
import parcel_icon from "./parcel_icon.png";

export const assets = {
  logo,
  basket_icon,
  header_img,
  search_icon,
  rating_starts,
  add_icon_green,
  add_icon_white,
  remove_icon_red,
  app_store,
  play_store,
  linkedin_icon,
  facebook_icon,
  twitter_icon,
  cross_icon,
  selector_icon,
  profile_icon,
  logout_icon,
  bag_icon,
  parcel_icon,
};

import Burger from "./Burger.jpg";
import Burito from "./Burito.png";
import Chicken from "./Gà.jpg";
import Hot_dog from "./Hot dog.jpg";
import Pasta from "./Pasta.jpg";
import Salad from "./Salad.jpg";
import Sandwich from "./Sandwich.jpg";
import Tart from "./Tart.jpg";

export const menu_list = [
  {
    menu_name: "Burger",
    menu_image: Burger,
  },
  {
    menu_name: "Burito",
    menu_image: Burito,
  },
  {
    menu_name: "Gà ",
    menu_image: Chicken,
  },
  {
    menu_name: "Hot dog",
    menu_image: Hot_dog,
  },
  {
    menu_name: "Pasta",
    menu_image: Pasta,
  },
  {
    menu_name: "Salad",
    menu_image: Salad,
  },
  {
    menu_name: "Sandwich",
    menu_image: Sandwich,
  },
  {
    menu_name: "Tart",
    menu_image: Tart,
  },
];

export const food_list = [
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d78",
    },
    name: "Burger nguyên bản",
    description:
      "bao gồm 1 miếng bò áp chảo cùng với 1 lớp phô mai phía trên, bao phủ bởi một lớp tương cà và mù tạt",
    price: 30000,
    image: "nguyên bản.jpg",
    category: "Burger",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d79",
    },
    name: "Burger gà",
    description:
      "bao gồm 2 miếng ức gà chiên, dưa muối cùng với bắp cải bào sợi, phủ trên cùng là một lớp dưa muối và mù tạt vàng",
    price: 30000,
    image: "2 miếng gà.jpg",
    category: "Burger",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d7a",
    },
    name: "Burger Bò phô mai",
    description:
      "bao gồm hai miếng bò áp chảo, 1 lớp phô mai, ăn cùng rau sà lách và dưa chuột muối, trên cùng là một lớp mù tạt vàng và tương cà",
    price: 30000,
    image: "2 miếng bò.jpg",
    category: "Burger",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d7b",
    },
    name: "Burger Bò và thịt heo xông khói",
    description:
      "bao gồm hai miếng bò áp chảo, hai lớp phô mai, hai lớp thịt heo xông khói áp chảo, ăn cùng hành tây xào và mù tạt vàng",
    price: 30000,
    image: "2 bò + thịt heo xông khói.png",
    category: "Burger",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d7c",
    },
    name: "Burito nhân bò bằm ",
    description:
      "phần nhân bao gồm bò bằm, hành ớt và phô mai, kêt hợp cùng phần sốt tiêu đen himalaya",
    price: 30000,
    image: "nhân bò bằm.jpg",
    category: "Burito",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d7d",
    },
    name: "Burito nhân bò ngô ",
    description:
      "phần nhân bao gồm bò bằm, ngô tách hạt,kết hợp cùng phần sốt BBQ đặc biệt kèm tương cà",
    price: 30000,
    image: "nhân bò ngô.jpg",
    category: "Burito",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d7e",
    },
    name: "Burito nhân bò xào rau củ ",
    description:
      "phần nhân bao gồm bò thái hạt lựu xào cùng cà chua, hành tây và quả oliu, kết hợp cùng sốt phô mai đặc biệt",
    price: 30000,
    image: "nhân bò thái hạt lựu.jpg",
    category: "Burito",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d7f",
    },
    name: "Burito nhân cơm thịt xào đậu đỏ ",
    description:
      "phần nhân bao gồm cơm rang thịt lợn bằm cùng rau rủ thái nhỏ, ăn cùng sốt phô mai đặc biệt",
    price: 30000,
    image: "nhân cơm xào đậu đỏ.jpg",
    category: "Burito",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d80",
    },
    name: "Burito nhân cơm thịt băm phô mai ",
    description:
      "phần nhân bao gồm thịt băm xào cùng cà chua kết hợp cùng sốt tiêu đen và một lớp phô mai phía trên cùng",
    price: 30000,
    image: "thịt băm phô mai.jpg",
    category: "Burito",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d81",
    },
    name: "Cánh gà chiên mắm ",
    description:
      "Phần giữa của cánh gà chiên giòn kết hợp cùng nước sốt mắm tỏi ớt chua cay",
    price: 30000,
    image: "cánh gà chiên mắm.jpg",
    category: "Gà ",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d82",
    },
    name: "Cánh gà chiên giòn ",
    description: "Cánh gà tẩm bột tỏi và bột chiên giòn với hương vị cổ điển",
    price: 30000,
    image: "cánh gà rán.jpg",
    category: "Gà ",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d83",
    },
    name: "Ức gà chiên",
    description:
      "Ức gà chiên giòn nguyên miếng ngon ngọt mọng nước ăn cùng nước sốt Branch",
    price: 30000,
    image: "ức gà chiên.jpg",
    category: "Gà ",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d84",
    },
    name: "Hot dog cơ bản không rau",
    description:
      "Một cây xúc xích kẹp bánh mì ăn cùng mù tạt vàng và gia vị đặc biệt ",
    price: 30000,
    image: "cơ bản không rau.jpg",
    category: "Hot dog",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d85",
    },
    name: "Hot dog đầy đủ full topping",
    description:
      "Một cây xúc xích kẹp bánh mì ăn kèm dưa chuột và ớt muối đi cùng với và chua và hành thái hạt lựu ",
    price: 30000,
    image: "đầy đủ full topping.jpg",
    category: "Hot dog",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d86",
    },
    name: "Hot dog dưa muối hành tây",
    description:
      "Một cây xúc xích kẹp bánh mì ăn kèm dưa chuột muối và hành tây xào ",
    price: 30000,
    image: "hot dog dưa muối + hành tây .jpg",
    category: "Hot dog",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d89",
    },
    name: "Pasta cà chua oliu",
    description:
      "Nui xoăn xào cà chua và quả oliu kết hợp cùng sốt kem tiêu đặc biệt  ",
    price: 30000,
    image: "cà chua + oliu.jpg",
    category: "Pasta",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d8a",
    },
    name: "Pasta cà chua phô mai",
    description: "Nui ống xào cà chua phô mai kết hợp cùng sốt kem đặc biệt  ",
    price: 30000,
    image: "cà chua phô mai.jpg",
    category: "Pasta",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d8b",
    },
    name: "Mì Ý sốt kem",
    description: "Mì Ý sốt kem cà chua kết hợp cùng tiêu đen và lá hương thảo ",
    price: 30000,
    image: "mì ý sốt kem.jpg",
    category: "Pasta",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d8c",
    },
    name: "Pasta sốt kem",
    description:
      "Pasta sợi dài kết hợp cùng sốt kem đặc biệt và lá hương thảo ",
    price: 30000,
    image: "pasta sốt kem.jpg",
    category: "Pasta",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d8d",
    },
    name: "Nui sốt cay",
    description: "Nui xoăn kết hợp cùng sốt tiêu cay ",
    price: 30000,
    image: "sốt cay.jpg",
    category: "Pasta",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d8e",
    },
    name: "Salad phô mai cà chua",
    description:
      "Phô mai hy lạp kết hợp cùng cà chua bi nhiệt đới trộn dầu oliu",
    price: 30000,
    image: "phô mai cà chua.jpg",
    category: "Salad",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d8f",
    },
    name: "Salad bơ ",
    description:
      "Bao gồm bơ, cải thìa, cà chua, quả oliu ăn cùng bánh mì nướng giòn",
    price: 30000,
    image: "salad bơ.jpg",
    category: "Salad",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d90",
    },
    name: "Salad nhiệt đới ",
    description:
      "Bao gồm các loại rau củ nhiệt đới như cà chua, dưa chuột muối, rau xà lách trộn cùng dầu oliu",
    price: 30000,
    image: "salad nhiệt đới.jpg",
    category: "Salad",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d91",
    },
    name: "Salad rau trứng ",
    description:
      "Là sự kết hợp thanh đạm đến từ các loại rau củ như cà chua, bắp cải, rau xà lách và trứng luộc trộn cùng sốt mayo",
    price: 30000,
    image: "salad rau trứng.jpg",
    category: "Salad",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d92",
    },
    name: "Salad rau  ",
    description:
      "Bao gồm các loại rau tươi mái của mùa hè như cà chua, xà lach, bắp cải tím trộn cùng dầu oliu",
    price: 30000,
    image: "salad rau.jpg",
    category: "Salad",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d93",
    },
    name: "Sandwich nhân cá hồi ",
    description:
      "Sự kết hợp giữa cá hồi nướng trộn cùng sốt mayo béo ngậy hòa quyện, ăn cùng khoai tây chiên",
    price: 30000,
    image: "nhân cá hồi.jpg",
    category: "Sandwich",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d94",
    },
    name: "Sandwich nhân thịt nguội phô mai ",
    description: "Bao gồm thịt nguội thái lát kết hợp cùng phô mai keos sợi",
    price: 30000,
    image: "nhân thịt nguôi phô mai.jpg",
    category: "Sandwich",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d95",
    },
    name: "Bánh táo ",
    description: "Bánh táo làm theo công thức của Pháp cực ngon",
    price: 30000,
    image: "bánh táo.jpg",
    category: "Tart",
    __v: 0,
  },
  {
    _id: {
      $oid: "66e03657b1df745d6b3f6d96",
    },
    name: "Tart trứng phô mai ",
    description: "Bánh tart vị trứng phô mai là vị mới sản xuất của quán",
    price: 30000,
    image: "trứng phô mai.jpg",
    category: "Tart",
    __v: 0,
  },
];
