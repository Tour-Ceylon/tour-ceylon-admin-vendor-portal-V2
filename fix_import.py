import sys
path = r'c:\Users\ASUS\Desktop\TOUR\tour-ceylon-admin-vendor-portal-V2\src\app\components\listings\ListingReviewPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { apiFetch } from "../../api/apiClient";', 'import { apiFetch } from "../api/apiClient";')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed import path!')
