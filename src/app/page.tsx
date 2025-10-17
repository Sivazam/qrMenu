'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import FilterBar, { FilterType, SortType } from '@/components/FilterBar';
import CategorySection from '@/components/CategorySection';
import FloatingMenu from '@/components/FloatingMenu';
import { fetchMenuItems, fetchCategories, fetchFranchise, MenuItem, Category } from '@/lib/firestore';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [franchise, setFranchise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('default');
  const [selectedPortions, setSelectedPortions] = useState<Record<string, 'full' | 'half'>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuData, categoriesData, franchiseData] = await Promise.all([
          fetchMenuItems(),
          fetchCategories(),
          fetchFranchise()
        ]);
        
        setMenuItems(menuData);
        setCategories(categoriesData);
        setFranchise(franchiseData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (activeFilter === 'veg') {
        matchesFilter = item.isVegetarian;
      } else if (activeFilter === 'non-veg') {
        matchesFilter = !item.isVegetarian;
      }

      return matchesSearch && matchesFilter;
    });

    // Sort items - create a new array to avoid mutation
    const sorted = [...filtered];
    if (activeSort === 'price-low-high') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-high-low') {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [menuItems, searchQuery, activeFilter, activeSort]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    
    filteredAndSortedItems.forEach(item => {
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = [];
      }
      groups[item.categoryId].push(item);
    });

    return groups;
  }, [filteredAndSortedItems]);

  // Sort categories based on active sort type
  const sortedCategories = useMemo(() => {
    if (activeSort === 'default') {
      // Default behavior: Starters first, then original order
      return categories.sort((a, b) => {
        if (a.name === 'Starters') return -1;
        if (b.name === 'Starters') return 1;
        return 0;
      });
    } else {
      // Price sorting: Sort categories based on their items' prices
      return categories
        .map(category => {
          const items = groupedItems[category.id] || [];
          const minPrice = items.length > 0 ? Math.min(...items.map(item => item.price)) : Infinity;
          const maxPrice = items.length > 0 ? Math.max(...items.map(item => item.price)) : 0;
          const avgPrice = items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0;
          
          return {
            ...category,
            minPrice,
            maxPrice,
            avgPrice,
            itemCount: items.length
          };
        })
        .sort((a, b) => {
          if (activeSort === 'price-low-high') {
            // Sort by minimum price, then by average price for ties
            if (a.minPrice !== b.minPrice) {
              return a.minPrice - b.minPrice;
            }
            return a.avgPrice - b.avgPrice;
          } else if (activeSort === 'price-high-low') {
            // Sort by maximum price, then by average price for ties
            if (a.maxPrice !== b.maxPrice) {
              return b.maxPrice - a.maxPrice;
            }
            return b.avgPrice - a.avgPrice;
          }
          return 0;
        });
    }
  }, [categories, groupedItems, activeSort]);

  const categoryList = useMemo(() => {
    if (activeSort === 'default') {
      // Default: Use the same logic as sortedCategories
      const categoryEntries = Object.entries(groupedItems).map(([categoryId, items]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          id: categoryId,
          name: category?.name || 'Unknown Category',
          itemCount: items.length
        };
      });
      
      return categoryEntries.sort((a, b) => {
        if (a.name === 'Starters') return -1;
        if (b.name === 'Starters') return 1;
        return 0;
      });
    } else {
      // Price sorting: Use the same order as sortedCategories
      return sortedCategories.map(category => ({
        id: category.id,
        name: category.name,
        itemCount: category.itemCount || 0
      }));
    }
  }, [groupedItems, categories, activeSort, sortedCategories]);

  const handlePortionChange = (itemId: string, portion: 'full' | 'half') => {
    setSelectedPortions(prev => ({
      ...prev,
      [itemId]: portion
    }));
  };

  const handleSortChange = (sort: SortType) => {
    setActiveSort(sort);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerHeight = 180; // Increased to account for sticky header with search and filters
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 0.5,
            y: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
          className="relative"
        >
          <img
            src="/favicon.png"
            alt="Loading..."
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 border-2 border-white/30 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      {franchise && (
        <div className="relative">
          {/* Landscape Logo */}
          <div className="h-32 md:h-40 overflow-hidden bg-black">
            <img
              src={franchise.logoUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=200&fit=crop"}
              alt="Restaurant Logo"
              className="w-full h-full object-contain"
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          {/* Address Below Image */}
          <div className="bg-card border-b border-border px-4 py-3 text-center">
            <p className="text-muted-foreground text-sm md:text-base font-medium">
              {franchise.address}
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto p-4">
          {/* Search Bar - Full Width */}
          <div className="mb-4">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* Filter Bar */}
          <FilterBar
            onFilterChange={setActiveFilter}
            onSortChange={handleSortChange}
            activeFilter={activeFilter}
            activeSort={activeSort}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {Object.entries(groupedItems).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'No items found matching your search.' : 'No menu items available.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {sortedCategories.map((category) => {
              const items = groupedItems[category.id];
              if (!items || items.length === 0) return null;
              
              return (
                <div key={category.id} id={`category-${category.id}`}>
                  <CategorySection
                    categoryName={category.name}
                    items={items}
                    onPortionChange={handlePortionChange}
                    selectedPortions={selectedPortions}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Menu */}
      <FloatingMenu
        categories={categoryList}
        onCategoryClick={scrollToCategory}
      />
    </div>
  );
}