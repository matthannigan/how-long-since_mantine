import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  IconAlertCircle,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { ActionIcon, Alert, Badge, Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { categoryService } from '@/lib/services/CategoryService';
import type { Category, CategoryWithTaskCount } from '@/types';
import { CategoryBadge } from '../CategoryBadge/CategoryBadge';
import { CategoryDeleteModal } from '../CategoryDeleteModal/CategoryDeleteModal';
import { CategoryForm } from '../CategoryForm/CategoryForm';

interface CategoryListProps {
  onCategoryChange?: () => void;
}

export function CategoryList({ onCategoryChange }: CategoryListProps) {
  const [categories, setCategories] = useState<CategoryWithTaskCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategoriesWithTaskCounts();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormMode('create');
    setFormOpened(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormMode('edit');
    setFormOpened(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpened(true);
  };

  const handleFormSuccess = () => {
    loadCategories();
    onCategoryChange?.();
  };

  const handleDeleteSuccess = () => {
    loadCategories();
    onCategoryChange?.();
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setCategories(items);

    try {
      // Update order in database
      const categoryIds = items.map((cat) => cat.id);
      await categoryService.reorderCategories(categoryIds);
      onCategoryChange?.();
    } catch (error) {
      // Revert on error
      loadCategories();
    }
  };

  if (loading) {
    return (
      <Group justify="center" p="xl">
        <Loader size="md" />
        <Text>Loading categories...</Text>
      </Group>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error Loading Categories"
        color="red"
        variant="light"
      >
        {error}
        <Button variant="light" size="xs" mt="sm" onClick={loadCategories}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          Categories
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateCategory}>
          Add Category
        </Button>
      </Group>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <Stack gap="xs" {...provided.droppableProps} ref={provided.innerRef}>
              {categories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      shadow="xs"
                      padding="md"
                      radius="md"
                      withBorder
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
                      }}
                    >
                      <Group justify="space-between" align="center">
                        <Group gap="sm" style={{ flex: 1 }}>
                          <ActionIcon
                            {...provided.dragHandleProps}
                            variant="subtle"
                            color="gray"
                            size="sm"
                            style={{ cursor: 'grab' }}
                            aria-label="Drag to reorder"
                          >
                            <IconGripVertical size={16} />
                          </ActionIcon>

                          <CategoryBadge category={category} />

                          <Group gap="xs">
                            <Badge variant="light" size="xs">
                              {category.taskCount} task{category.taskCount !== 1 ? 's' : ''}
                            </Badge>
                            {category.overdueTaskCount > 0 && (
                              <Badge variant="light" color="red" size="xs">
                                {category.overdueTaskCount} overdue
                              </Badge>
                            )}
                            {category.isDefault && (
                              <Badge variant="light" color="blue" size="xs">
                                Default
                              </Badge>
                            )}
                          </Group>
                        </Group>

                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEditCategory(category)}
                            aria-label={`Edit ${category.name} category`}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={category.isDefault}
                            aria-label={`Delete ${category.name} category`}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      {categories.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          No categories found. Create your first category to get started.
        </Text>
      )}

      <CategoryForm
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        onSuccess={handleFormSuccess}
        category={selectedCategory || undefined}
        mode={formMode}
      />

      <CategoryDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        onSuccess={handleDeleteSuccess}
        category={selectedCategory}
      />
    </Stack>
  );
}
