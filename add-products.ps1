# Add sample products to DynamoDB
$products = @(
    @{
        productId = "prod-001"
        name = "Premium Laptop"
        description = "High-performance laptop with latest specs"
        price = 999.99
        category = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
    },
    @{
        productId = "prod-002"
        name = "Smart Fitness Watch"
        description = "Advanced fitness tracker with heart rate monitoring"
        price = 299.99
        category = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
    },
    @{
        productId = "prod-003"
        name = "Wireless Headphones"
        description = "Premium noise-cancelling wireless headphones"
        price = 199.99
        category = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    },
    @{
        productId = "prod-004"
        name = "Cotton T-Shirt"
        description = "Comfortable organic cotton t-shirt"
        price = 29.99
        category = "Clothing"
        imageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
    },
    @{
        productId = "prod-005"
        name = "Coffee Maker"
        description = "12-cup programmable coffee maker"
        price = 149.99
        category = "Home"
        imageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"
    },
    @{
        productId = "prod-006"
        name = "Gaming Keyboard"
        description = "RGB backlit mechanical gaming keyboard"
        price = 129.99
        category = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"
    },
    @{
        productId = "prod-007"
        name = "Bluetooth Speaker"
        description = "Waterproof portable Bluetooth speaker"
        price = 79.99
        category = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"
    },
    @{
        productId = "prod-008"
        name = "Yoga Mat"
        description = "Non-slip premium yoga mat"
        price = 49.99
        category = "Sports"
        imageUrl = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400"
    }
)

foreach ($product in $products) {
    $item = @{
        productId = @{ S = $product.productId }
        name = @{ S = $product.name }
        description = @{ S = $product.description }
        price = @{ N = $product.price.ToString() }
        category = @{ S = $product.category }
        imageUrl = @{ S = $product.imageUrl }
        createdAt = @{ S = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ") }
        updatedAt = @{ S = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ") }
        isActive = @{ BOOL = $true }
    }
    
    $json = $item | ConvertTo-Json -Depth 3 -Compress
    $json | Out-File -FilePath "temp-product.json" -Encoding UTF8 -NoNewline
    
    Write-Host "Adding product: $($product.name)"
    aws dynamodb put-item --table-name "mini-ecommerce-dev-products" --item file://temp-product.json --region ap-southeast-1
    
    Remove-Item "temp-product.json" -ErrorAction SilentlyContinue
}

Write-Host "All products added successfully!"
