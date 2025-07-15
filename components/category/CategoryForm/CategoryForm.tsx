import { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { categoryService } from '@/lib/services/CategoryService';
import type { Category, CategoryFormData } from '@/types';
import { CategoryColorPicker } from '../CategoryColorPicker/CategoryColorPicker';
import { CategoryIconSelector } from '../CategoryIconSelector/CategoryIconSelector';

interface CategoryFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
  category?: Category;
  mode: 'create' | 'edit';
}

export function CategoryForm({ opened, onClose, onSuccess, category, mode }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormData>({
    initialValues: {
      name: category?.name || '',
      color: category?.color || '#3B82F6',
      icon: category?.icon || undefined,
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Category name is required';
        }
        if (value.length > 50) {
          return 'Category name must be 50 characters or less';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: CategoryFormData) => {
    // Validate the form before proceeding
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    setLoading(true);
    try {
      let result: Category;

      if (mode === 'create') {
        result = await categoryService.createCategory(values);
        notifications.show({
          title: 'Success',
          message: `Category "${values.name}" created successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        if (!category) {
          throw new Error('Category is required for edit mode');
        }
        result = await categoryService.updateCategory(category.id, values);
        notifications.show({
          title: 'Success',
          message: `Category "${values.name}" updated successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      onSuccess(result);
      onClose();
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      form.reset();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Category' : 'Edit Category'}
      size="md"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            required
            {...form.getInputProps('name')}
            disabled={loading}
            data-autofocus
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Color
            </Text>
            <CategoryColorPicker
              value={form.values.color}
              onChange={(color) => form.setFieldValue('color', color)}
              disabled={loading}
            />
            {form.errors.color && (
              <Text size="xs" c="red" mt="xs">
                {form.errors.color}
              </Text>
            )}
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Icon (Optional)
            </Text>
            <CategoryIconSelector
              value={form.values.icon}
              onChange={(icon) => form.setFieldValue('icon', icon)}
              disabled={loading}
            />
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconCheck size={16} />}
              onClick={(e) => {
                e.preventDefault();
                const validation = form.validate();
                if (!validation.hasErrors) {
                  handleSubmit(form.values);
                }
              }}
            >
              {mode === 'create' ? 'Create Category' : 'Save Changes'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
