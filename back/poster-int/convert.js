// ------------------------------------------------------------------------------------------------
// (c) Kult Hliba, 2019.
//
// ------------------------------------------------------------------------------------------------
// poster-int/convert.js
// Defines functions for converting betweeing KH and Poster entities.
// ------------------------------------------------------------------------------------------------

const _ = require('lodash');

// toPosterTechMapSpec converts KH tech map to Poster Techmap Specification from which it can be created via PosterAPI.
function toPosterTechMapSpec(khTechMap) {
    // See https://dev.joinposter.com/en/docs/v3/web/menu/createDish?id=post-parameters-of-the-menucreatedish-request
    const product_name = khTechMap.name;
    const menu_category_id = -1; // TODO
    const different_spots_prices = -1; // TODO
    const workshop = -1; // TODO
    const product_color = -1;

    const posterIngridients = _.map(khTechMap.ingredients, khIngridient => {
        return {
            id: lookupId(),
            "type":  1,
            "unit": "kg",
            "weight": 0,
            "stew": 0,
            "bake": 0,
            "brutto": 10,
            "lock": 1,
            "netto": 10,
        }
    });

    return {
        product_name: khTechMap.name,
        menu_category_id: '',
        different_spots_prices: '',
        ingredient: posterIngridients,
        workshop: '',
        weight_flag: '',
        product_color: '',
        nodiscount: '',
    }
    // KHTechMap {
        // ingredients: [
        //     {
        //       ingredientId: "ING-XXX-YYY-ZZZ-YY0",
        //       countByUnits: new Map([[1, 292], [6, 1752]])
    // }
    // $dish = [
    //     'product_name' => 'Кальян с сюрпризом',
    //     'menu_category_id' => 151,
    //     'different_spots_prices' => 1,
    //     'workshop' => 4,
    //     'weight_flag' => 0,
    //     'product_color' => 'red',
    //     'nodiscount' => 1,
    //     'price' => [
    //         1 => 55,
    //         2 => 57,
    //     ],
    //     'visible' => [
    //         1 => 1,
    //         2 => 0,
    //     ],
    //     "ingredient" => [[
    //         "id" => 813,
    //         "type" => 1,
    //         "unit" => "kg",
    //         "weight" => 0,
    //         "stew" => 0,
    //         "bake" => 0,
    //         "brutto" => 10,
    //         "lock" => 1,
    //         "netto" => 10,
    //     ]],
    //     'modificationgroup' => [
    //         [
    //             'type'          => 1,
    //             'minNum'        => 1,
    //             'maxNum'        => 1,
    //             'name'          => 'Чаша',
    //             "modifications" => [
    //                 [
    //                     "ingredientId" => 820,
    //                     "type" => 1,
    //                     "name" => "Классическая чаша",
    //                     "brutto" => 1,
    //                     "price" => 500,
    //                 ],
    //                 [
    //                     "ingredientId" => 816,
    //                     "name" => "Апельсиновая чаша",
    //                     "type" => 1,
    //                     "brutto" => 1,
    //                     "price" => 400,
    //                 ],
    //             ]
    //         ]
    //     ]
    // ];        
}

// Converts poster stock item to KH stock item.
function toKHStockItem(posterStockItem) {

}


