import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../src/lib/supabase";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react-native";

interface ItemData {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

interface SectionData {
  id: string;
  name: string;
  slug: string;
  section_type: string | null;
  sort_order: number;
  is_visible: boolean;
  items: ItemData[];
}

export default function PageEditorScreen() {
  const router = useRouter();
  const { id: businessId, pageId } = useLocalSearchParams();

  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionModal, setSectionModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    sectionId: string;
    item?: ItemData;
  } | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    try {
      const { data: pg } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single();

      const { data: secs } = await supabase
        .from("sections")
        .select("*, items(*)")
        .eq("page_id", pageId)
        .order("sort_order");

      setPage(pg);
      setSections(secs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addSection() {
    if (!newSectionName.trim()) return;
    const slug = newSectionName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const { data, error } = await supabase
      .from("sections")
      .insert({
        page_id: pageId,
        name: newSectionName,
        slug,
        sort_order: sections.length,
        is_visible: true,
      })
      .select()
      .single();

    if (!error && data) {
      setSections([...sections, { ...data, items: [] }]);
      setNewSectionName("");
      setSectionModal(false);
    }
  }

  async function deleteSection(sectionId: string) {
    Alert.alert("Excluir Seção", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await supabase.from("sections").delete().eq("id", sectionId);
          setSections(sections.filter((s) => s.id !== sectionId));
        },
      },
    ]);
  }

  async function toggleSectionVisibility(section: SectionData) {
    const { data } = await supabase
      .from("sections")
      .update({ is_visible: !section.is_visible })
      .eq("id", section.id)
      .select()
      .single();

    if (data) {
      setSections(
        sections.map((s) =>
          s.id === section.id ? { ...s, is_visible: data.is_visible } : s
        )
      );
    }
  }

  function openItemForm(sectionId: string, item?: ItemData) {
    if (item) {
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: item.price?.toString() || "",
      });
      setEditingItem({ sectionId, item });
    } else {
      setItemForm({ name: "", description: "", price: "" });
      setEditingItem({ sectionId });
    }
    setItemModal(true);
  }

  async function saveItem() {
    if (!itemForm.name.trim() || !editingItem) return;
    setSavingItem(true);

    try {
      const price = itemForm.price ? parseFloat(itemForm.price) : null;
      const section = sections.find((s) => s.id === editingItem.sectionId);

      if (editingItem.item) {
        // Update existing item
        const { data } = await supabase
          .from("items")
          .update({
            name: itemForm.name,
            description: itemForm.description || null,
            price,
          })
          .eq("id", editingItem.item.id)
          .select()
          .single();

        if (data) {
          setSections(
            sections.map((s) => ({
              ...s,
              items: s.items.map((i) => (i.id === data.id ? data : i)),
            }))
          );
        }
      } else {
        // Create new item
        const { data } = await supabase
          .from("items")
          .insert({
            section_id: editingItem.sectionId,
            name: itemForm.name,
            description: itemForm.description || null,
            price,
            sort_order: section?.items.length || 0,
          })
          .select()
          .single();

        if (data) {
          setSections(
            sections.map((s) =>
              s.id === editingItem.sectionId
                ? { ...s, items: [...s.items, data] }
                : s
            )
          );
        }
      }

      setItemModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingItem(false);
    }
  }

  async function deleteItem(itemId: string, sectionId: string) {
    await supabase.from("items").delete().eq("id", itemId);
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      )
    );
  }

  async function toggleItemAvailability(item: ItemData, sectionId: string) {
    const { data } = await supabase
      .from("items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id)
      .select()
      .single();

    if (data) {
      setSections(
        sections.map((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === item.id ? data : i)),
        }))
      );
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{page?.title || "Editor"}</Text>
          <Text style={styles.headerSub}>
            {sections.length} seções ·{" "}
            {sections.reduce((acc, s) => acc + s.items.length, 0)} itens
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Sections */}
        {sections.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Nenhuma seção</Text>
            <Text style={styles.emptyText}>
              Adicione seções para organizar seus itens
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  {section.section_type && (
                    <View style={styles.sectionTypeBadge}>
                      <Text style={styles.sectionTypeText}>
                        {section.section_type}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    onPress={() => toggleSectionVisibility(section)}
                    style={styles.sectionAction}
                  >
                    {section.is_visible ? (
                      <ToggleRight size={20} color="#00C853" />
                    ) : (
                      <ToggleLeft size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteSection(section.id)}
                    style={styles.sectionAction}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Items */}
              {section.items.length === 0 ? (
                <Text style={styles.noItemsText}>Nenhum item</Text>
              ) : (
                section.items.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      !item.is_available && styles.itemUnavailable,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.itemInfo}
                      onPress={() => openItemForm(section.id, item)}
                    >
                      <View style={styles.itemIcon}>
                        <Package size={16} color="#6B7280" />
                      </View>
                      <View style={styles.itemDetails}>
                        <Text
                          style={[
                            styles.itemName,
                            !item.is_available && styles.textMuted,
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text style={styles.itemDesc} numberOfLines={1}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                      {item.price != null && item.price > 0 && (
                        <Text style={styles.itemPrice}>
                          R$ {item.price.toFixed(2)}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        onPress={() =>
                          toggleItemAvailability(item, section.id)
                        }
                        style={styles.itemActionBtn}
                      >
                        {item.is_available ? (
                          <ToggleRight size={16} color="#00C853" />
                        ) : (
                          <ToggleLeft size={16} color="#9CA3AF" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteItem(item.id, section.id)}
                        style={styles.itemActionBtn}
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => openItemForm(section.id)}
              >
                <Plus size={16} color="#00C853" />
                <Text style={styles.addItemText}>Adicionar item</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Add Section Button */}
        <TouchableOpacity
          style={styles.addSectionBtn}
          onPress={() => setSectionModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addSectionText}>Adicionar Seção</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Section Modal */}
      <Modal visible={sectionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Seção</Text>
            <TextInput
              style={styles.modalInput}
              value={newSectionName}
              onChangeText={setNewSectionName}
              placeholder="Nome da seção..."
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setSectionModal(false);
                  setNewSectionName("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={addSection}
              >
                <Text style={styles.modalConfirmText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Item Form Modal */}
      <Modal visible={itemModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.itemModalContent}>
            <Text style={styles.modalTitle}>
              {editingItem?.item ? "Editar Item" : "Novo Item"}
            </Text>

            <Text style={styles.inputLabel}>Nome *</Text>
            <TextInput
              style={styles.modalInput}
              value={itemForm.name}
              onChangeText={(t) => setItemForm({ ...itemForm, name: t })}
              placeholder="Ex: Prato Feito"
              autoFocus
            />

            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={itemForm.description}
              onChangeText={(t) =>
                setItemForm({ ...itemForm, description: t })
              }
              placeholder="Descrição do item..."
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Preço (R$)</Text>
            <TextInput
              style={styles.modalInput}
              value={itemForm.price}
              onChangeText={(t) => setItemForm({ ...itemForm, price: t })}
              placeholder="29.90"
              keyboardType="decimal-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setItemModal(false);
                  setEditingItem(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  (!itemForm.name.trim() || savingItem) && { opacity: 0.5 },
                ]}
                onPress={saveItem}
                disabled={!itemForm.name.trim() || savingItem}
              >
                {savingItem ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    {editingItem?.item ? "Salvar" : "Adicionar"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  headerSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sectionTypeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionTypeText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  sectionActions: {
    flexDirection: "row",
    gap: 4,
  },
  sectionAction: {
    padding: 6,
  },
  noItemsText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 13,
    padding: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  itemUnavailable: {
    opacity: 0.5,
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  itemDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00C853",
  },
  itemActions: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  itemActionBtn: {
    padding: 6,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
  },
  addItemText: {
    fontSize: 13,
    color: "#00C853",
    fontWeight: "500",
  },
  addSectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00C853",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addSectionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
  },
  itemModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalConfirm: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#00C853",
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  textMuted: {
    color: "#9CA3AF",
  },
});
