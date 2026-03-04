# CMS Architecture Fixes

## Problems Fixed

### 1. **Stale Cache Issues**
- **Problem**: localStorage could contain outdated data with no way to verify freshness
- **Solution**: Added `updatedAt` timestamps to all API responses and localStorage cache
- **Implementation**: `isCacheStale()` function compares timestamps before using cache

### 2. **Race Conditions**
- **Problem**: Multiple components fetching same data simultaneously could cause conflicts
- **Solution**: Request deduplication in `useCMS` hook using `fetchPromiseRef`
- **Implementation**: If a request is in progress, subsequent calls wait for the same promise

### 3. **No Reusable Helpers**
- **Problem**: Duplicate fetch/save logic in every component
- **Solution**: Created `getCMSData()` and `saveCMSData()` utilities + `useCMS()` hook
- **Implementation**: Single source of truth for all CMS operations

### 4. **Missing updatedAt Comparison**
- **Problem**: No way to know if localStorage data is newer than API data
- **Solution**: Backend now returns `updatedAt` in all responses, stored in localStorage
- **Implementation**: Cache only used if API fails, always prefer fresh API data

### 5. **Inconsistent Error Handling**
- **Problem**: Errors handled differently across components
- **Solution**: Centralized error handling in utilities
- **Implementation**: Proper try/catch with fallback strategies

## New Architecture

### Core Utilities (`src/utils/cms.ts`)

```typescript
// Get CMS data (API first, localStorage fallback)
getCMSData(page, section, options)

// Save CMS data (API + localStorage cache update)
saveCMSData(page, section, data)

// Check if cache is stale
isCacheStale(page, section, apiUpdatedAt)

// Clear cache
clearCMSCache(page?, section?)
```

### React Hook (`src/hooks/useCMS.ts`)

```typescript
// Automatic fetching, caching, and real-time updates
const { data, loading, error, save, refresh, updatedAt } = useCMS<T>(
  page, 
  section, 
  options
)
```

**Features:**
- Auto-fetches on mount
- Real-time updates via `cmsUpdate` events
- Prevents race conditions
- Type-safe with TypeScript generics
- Proper loading/error states

### Backend Changes (`server/controllers/admin_cms.js`)

- `getSectionContent`: Now returns `{ success, data, updatedAt }`
- `saveSectionContent`: Now returns `{ success, data, updatedAt, message }`
- `getPageContent`: Returns `{ section: { data, updatedAt } }`

## Usage Examples

### Frontend Component (Before)
```typescript
// ❌ Old way - duplicate code, no cache management
const [data, setData] = useState({});
useEffect(() => {
  fetch('/api/...').then(r => r.json()).then(d => {
    setData(d.data);
    localStorage.setItem('key', JSON.stringify(d.data));
  });
}, []);
```

### Frontend Component (After)
```typescript
// ✅ New way - clean, type-safe, handles everything
const { data, loading, error } = useCMS<MyType>('about', 'hero', {
  defaultValue: { title: 'About Us' }
});
```

### Admin Save (Before)
```typescript
// ❌ Old way - manual localStorage management
fetch('/api/...', { method: 'POST', body: JSON.stringify(data) })
  .then(r => r.json())
  .then(result => {
    localStorage.setItem('key', JSON.stringify(result.data));
    window.dispatchEvent(new CustomEvent('cmsUpdate', ...));
  });
```

### Admin Save (After)
```typescript
// ✅ New way - automatic cache update and events
await saveCMSData('about', 'hero', data);
// Cache updated, events dispatched automatically
```

## Data Flow

1. **Fetch Flow:**
   ```
   Component → useCMS() → getCMSData()
   → Try API (with updatedAt)
   → If fails/404 → Try localStorage
   → If empty → Use defaultValue
   → Update component state
   ```

2. **Save Flow:**
   ```
   Admin Form → saveCMSData()
   → POST to API
   → API saves to DB (returns updatedAt)
   → Update localStorage cache (with updatedAt)
   → Dispatch cmsUpdate event
   → All components listening update automatically
   ```

3. **Cache Strategy:**
   - **Primary**: Database (via API) - source of truth
   - **Secondary**: localStorage - cache only, with updatedAt
   - **Fallback**: defaultValue - if no data exists

## Benefits

✅ **No stale cache** - updatedAt comparison ensures freshness  
✅ **No race conditions** - request deduplication  
✅ **DRY code** - reusable utilities  
✅ **Type-safe** - TypeScript generics  
✅ **Real-time updates** - event-driven architecture  
✅ **Better error handling** - centralized and consistent  
✅ **Production-ready** - proper loading states, error boundaries  

## Migration Notes

All About Us page components have been migrated to use the new system:
- `HeroSection.tsx` ✅
- `IntroductionSection.tsx` ✅
- `VisionMissionSection.tsx` ✅
- `PartnershipSection.tsx` ✅
- Admin page uses `saveCMSData()` ✅

Other pages can be migrated by replacing their fetch logic with `useCMS()` hook.

