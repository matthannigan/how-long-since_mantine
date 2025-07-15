import { useEffect, useState } from 'react';
import { IconAlertTriangle, IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { Alert, Button, Divider, Group, Modal, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { categoryService } from '@/lib/services/CategoryService';
import type { Category } from '@/types';
import { CategoryBadge } from '../CategoryBadge/CategoryBadge';

interface CategoryDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

export function CategoryDeleteModal({
  opened,
  onClose,
  onSuccess,
  category,
}: CategoryDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    if (opened && category) {
      loadCategoryData();
    }
  }, [opened, category]);

  const loadCategoryData = async () => {
    if (!category) {
      return;
    }

    try {
      // Get categories with task counts
      const categoriesWithCounts = await categoryService.getCategoriesWithTaskCounts();
      const currentCategory = categoriesWithCounts.find((c) => c.id === category.id);

      if (currentCategory) {
        setTaskCount(currentCategory.taskCount);
      }

      // Get other categories for reassignment
      const otherCategories = categoriesWithCounts.filter((c) => c.id !== category.id);
      setAvailableCategories(otherCategories);

      // Auto-select first available category if tasks exist
      if (currentCategory && currentCategory.taskCount > 0 && otherCategories.length > 0) {
        setSelectedCategoryId(otherCategories[0].id);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load category information',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleDelete = async () => {
    if (!category) {
      return;
    }

    setLoading(true);
    try {
      if (taskCount > 0) {
        if (!selectedCategoryId) {
          notifications.show({
            title: 'Error',
            message: 'Please select a category to reassign tasks to',
            color: 'red',
            icon: <IconX size={16} />,
          });
          return;
        }

        await categoryService.deleteCategoryWithReassignment(category.id, selectedCategoryId);
        notifications.show({
          title: 'Success',
          message: `Category "${category.name}" deleted and ${taskCount} tasks reassigned`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        await categoryService.deleteCategory(category.id);
        notifications.show({
          title: 'Success',
          message: `Category "${category.name}" deleted successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      onSuccess();
      onClose();
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
      setSelectedCategoryId('');
    }
  };

  if (!category) {
    return null;
  }

  const canDelete = !category.isDefault;
  const hasTasksToReassign = taskCount > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Title order={3} c="red">
          Delete Category
        </Title>
      }
      size="md"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <Stack gap="md">
        {!canDelete && (
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Cannot Delete Default Category"
            color="orange"
          >
            Default categories cannot be deleted as they are essential for the app's functionality.
          </Alert>
        )}

        {canDelete && (
          <>
            <Group gap="sm">
              <Text size="sm">You are about to delete:</Text>
              <CategoryBadge category={category} />
            </Group>

            {hasTasksToReassign && (
              <>
                <Alert
                  icon={<IconAlertTriangle size={16} />}
                  title="Tasks Need Reassignment"
                  color="yellow"
                >
                  This category has {taskCount} task{taskCount !== 1 ? 's' : ''} assigned to it. You
                  must choose another category to reassign these tasks to before deletion.
                </Alert>

                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Reassign tasks to:
                  </Text>
                  <Select
                    placeholder="Select a category"
                    value={selectedCategoryId}
                    onChange={(value) => setSelectedCategoryId(value || '')}
                    data={availableCategories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    disabled={loading}
                    required
                  />
                </div>
              </>
            )}

            {!hasTasksToReassign && (
              <Alert icon={<IconAlertTriangle size={16} />} title="Confirm Deletion" color="red">
                This action cannot be undone. The category will be permanently deleted.
              </Alert>
            )}

            <Divider />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
                loading={loading}
                leftSection={<IconTrash size={16} />}
                disabled={hasTasksToReassign && !selectedCategoryId}
              >
                Delete Category
              </Button>
            </Group>
          </>
        )}

        {!canDelete && (
          <Group justify="flex-end">
            <Button onClick={handleClose} disabled={loading}>
              Close
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}
