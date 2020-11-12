<?php

require_once 'shared.php';

$product = \Stripe\Product::retrieve($config['product']);
$price = \Stripe\Price::retrieve($config['price']);

echo json_encode(['publicKey' => $config['stripe_publishable_key'],
 'unitAmount' => $price['unit_amount'], 'currency' => $price['currency'], 
 'productName' => $product['name']]);
