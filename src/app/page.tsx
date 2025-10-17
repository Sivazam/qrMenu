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
        matchesFilter = item.isVeg;
      } else if (activeFilter === 'non-veg') {
        matchesFilter = !item.isVeg;
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

  const categoryList = useMemo(() => {
    return Object.entries(groupedItems).map(([categoryId, items]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        id: categoryId,
        name: category?.name || 'Unknown Category',
        itemCount: items.length
      };
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
      const headerHeight = 120; // Approximate header height
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-64 md:h-80 overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={franchise.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop"}
              alt={franchise.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center">
            <div className="px-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4"
              >
                {franchise.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg md:text-xl text-gray-200"
              >
                {franchise.address}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto p-4">
          {/* Search Bar */}
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
            {Object.entries(groupedItems).map(([categoryId, items]) => {
              const category = categories.find(c => c.id === categoryId);
              return (
                <div key={categoryId} id={`category-${categoryId}`}>
                  <CategorySection
                    categoryName={category?.name || 'Unknown Category'}
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