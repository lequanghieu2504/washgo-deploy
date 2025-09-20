@echo off
setlocal enabledelayedexpansion

set BASE_URL=http://localhost:8080

REM === Define locations for 2 carwashes ===
set locations[1]=456 Le Loi, Quan 1, Ho Chi Minh City
set locations[2]=929 Tran Hung Dao, Quan 5

REM === 1. Register admin, client, and 2 carwashes ===
echo Registering users...
curl -s -X POST %BASE_URL%/register -H "Content-Type: application/json" -d "{\"username\":\"adminUser\",\"email\":\"admin@example.com\",\"password\":\"password123\",\"role\":\"ADMIN\"}"
curl -s -X POST %BASE_URL%/register -H "Content-Type: application/json" -d "{\"username\":\"clientuser\",\"email\":\"clientuser01@example.com\",\"password\":\"password123\",\"role\":\"CLIENT\",\"phonenumber\":\"0123456789\",\"fullName\":\"Nguyen Van A\"}"

for /L %%i in (1,1,2) do (
    call set "loc=%%locations[%%i]%%"
    curl -s -X POST %BASE_URL%/register -H "Content-Type: application/json" -d "{\"username\":\"carwashUser%%i\",\"email\":\"cw%%i@example.com\",\"password\":\"password123\",\"role\":\"CARWASH\",\"carwashName\":\"WashGo CW%%i\",\"location\":\"!loc!\",\"description\":\"Branch %%i\"}"
)

REM === 2. Login as admin and get token ===
echo Logging in as admin...
curl -s -X POST %BASE_URL%/auth/login -H "Content-Type: application/json" -d "{\"username\":\"adminUser\",\"password\":\"password123\"}" > admin_login.json
for /f "delims=" %%t in ('powershell -Command "(Get-Content admin_login.json | ConvertFrom-Json).accessToken"') do set ADMIN_TOKEN=%%t
del admin_login.json

REM === 3. Create 2 product masters ===
echo Creating product masters...
for /L %%i in (1,1,2) do (
    curl -s -X POST %BASE_URL%/api/product-master -H "Content-Type: application/json" -H "Authorization: Bearer !ADMIN_TOKEN!" -d "{\"name\":\"ProductMaster%%i\",\"description\":\"Desc %%i\",\"category\":\"Cat %%i\"}"
)

REM === 4. For each carwash: login, create products, sub-products, price, schedule ===
for /L %%c in (1,1,2) do (
    echo --- Processing Carwash %%c ---
    set "CARWASH_USERNAME=carwashUser%%c"
    curl -s -X POST %BASE_URL%/auth/login -H "Content-Type: application/json" -d "{\"username\":\"!CARWASH_USERNAME!\",\"password\":\"password123\"}" > cw_login.json
    for /f "delims=" %%t in ('powershell -Command "(Get-Content cw_login.json | ConvertFrom-Json).accessToken"') do set CW_TOKEN=%%t
    del cw_login.json

    REM Create 2 products for this carwash (assume product master IDs 1-2)
    for /L %%p in (1,1,2) do (
        echo   Creating Product %%p for Carwash %%c...
        set /A PRODUCT_PRICE=150000 + !RANDOM! %% 150001
        curl -s -X POST %BASE_URL%/api/products/master -H "Content-Type: application/json" -H "Authorization: Bearer !CW_TOKEN!" -d "{\"name\":\"CW%%c-Product%%p\",\"description\":\"Product %%p for CW%%c\",\"effectiveFrom\":\"2025-06-01\",\"effectiveTo\":\"2025-12-31\",\"active\":true,\"timing\":\"01:00:00\",\"productMasterId\":%%p,\"price\":!PRODUCT_PRICE!,\"currency\":\"VND\"}" > product.json
        
        for /f "delims=" %%i in ('powershell -Command "(Get-Content product.json | ConvertFrom-Json).id"') do set "PRODUCT_ID=%%i"

        REM Create 2 sub-products for this product
        for /L %%s in (1,1,2) do (
            echo     Creating Sub-Product %%s...
            REM Create the sub-product entity (output is discarded as ID is not returned)
            curl -s -X POST %BASE_URL%/api/products/create/subProduct -H "Content-Type: application/json" -H "Authorization: Bearer !CW_TOKEN!" -d "{\"name\":\"CW%%c-Product%%p-Sub%%s\",\"description\":\"Sub %%s for Product %%p\",\"effectiveFrom\":\"2025-06-01\",\"effectiveTo\":\"2025-12-31\",\"active\":true,\"timing\":\"00:05:00\",\"parentId\":!PRODUCT_ID!,\"productMasterid\":%%p}" > NUL

            REM THE FIX: Calculate SUBPRODUCT_ID based on the parent PRODUCT_ID as requested
            set /A SUBPRODUCT_ID=!PRODUCT_ID! + %%s

            REM Generate random price for the calculated sub-product ID
            set /A SUB_PRICE=50000 + !RANDOM! %% 100001
            curl -s -X POST %BASE_URL%/api/pricing/product/!SUBPRODUCT_ID! -H "Content-Type: application/json" -H "Authorization: Bearer !CW_TOKEN!" -d "{\"price\":!SUB_PRICE!,\"currency\":\"VND\",\"description\":\"Price for subproduct\"}"
        )
    del product.json
    )

    REM Create schedule for carwash (assume carwashId = %%c+2)
    echo   Creating schedule for Carwash %%c...
    set /A CARWASH_ID=%%c+2
    curl -s -X POST %BASE_URL%/api/schedules/carwash -H "Content-Type: application/json" -H "Authorization: Bearer !CW_TOKEN!" -d "{\"availableFrom\":\"08:00:00\",\"availableTo\":\"18:00:00\",\"capacity\":10,\"carwashId\":!CARWASH_ID!,\"isActive\":true,\"accessToken\":\"!CW_TOKEN!\"}"
)

echo ==== DATA SETUP COMPLETE ====
endlocal
pause