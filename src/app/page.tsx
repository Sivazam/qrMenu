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

    // Sort items
    if (activeSort === 'price-low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-high-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
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

  // Sort categories to put Starters first
  const sortedCategories = useMemo(() => {
    return categories.sort((a, b) => {
      if (a.name === 'Starters') return -1;
      if (b.name === 'Starters') return 1;
      return 0;
    });
  }, [categories]);

  const categoryList = useMemo(() => {
    const categoryEntries = Object.entries(groupedItems).map(([categoryId, items]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        id: categoryId,
        name: category?.name || 'Unknown Category',
        itemCount: items.length
      };
    });
    
    // Sort categories to put Starters first, then maintain original order
    return categoryEntries.sort((a, b) => {
      if (a.name === 'Starters') return -1;
      if (b.name === 'Starters') return 1;
      return 0;
    });
  }, [groupedItems, categories]);

  const handlePortionChange = (itemId: string, portion: 'full' | 'half') => {
    setSelectedPortions(prev => ({
      ...prev,
      [itemId]: portion
    }));
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
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
            onSortChange={setActiveSort}
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