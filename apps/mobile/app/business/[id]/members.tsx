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
  RefreshControl,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../src/lib/supabase";
import {
  ArrowLeft,
  Users,
  Shield,
  Mail,
  UserPlus,
  Trash2,
  Crown,
  Star,
} from "lucide-react-native";

interface MemberData {
  id: string;
  user_id: string;
  role: string;
  invited_email: string | null;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  owner: { label: "Proprietário", color: "#D97706", icon: Crown },
  admin: { label: "Admin", color: "#3B82F6", icon: Shield },
  staff: { label: "Colaborador", color: "#6B7280", icon: Star },
};

export default function MembersScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();

  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [businessId]);

  async function loadMembers() {
    try {
      const { data } = await supabase
        .from("business_members")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: true });

      setMembers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);

    try {
      const { error } = await supabase.from("business_members").insert({
        business_id: businessId,
        invited_email: inviteEmail.trim(),
        role: inviteRole,
        status: "pending",
      });

      if (error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Convite enviado!", `Um convite foi enviado para ${inviteEmail}`);
        setShowInviteModal(false);
        setInviteEmail("");
        loadMembers();
      }
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setSendingInvite(false);
    }
  }

  async function removeMember(memberId: string, name: string) {
    Alert.alert("Remover Membro", `Remover ${name} da equipe?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await supabase.from("business_members").delete().eq("id", memberId);
          setMembers(members.filter((m) => m.id !== memberId));
        },
      },
    ]);
  }

  const displayedName = (m: MemberData) =>
    m.user_name || m.user_email || m.invited_email || "Usuário";

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
        <Text style={styles.headerTitle}>Equipe</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowInviteModal(true)}
        >
          <UserPlus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadMembers();
            }}
          />
        }
      >
        {members.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Nenhum Membro</Text>
            <Text style={styles.emptyText}>
              Convide pessoas para gerenciar este negócio
            </Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => setShowInviteModal(true)}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>Convidar Membro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map((member) => {
            const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.staff;
            const RoleIcon = roleCfg.icon;
            const isPending = member.status === "pending";

            return (
              <View
                key={member.id}
                style={[styles.memberCard, isPending && styles.memberPending]}
              >
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {displayedName(member).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>
                        {displayedName(member)}
                      </Text>
                      {isPending && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>Pendente</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.roleRow}>
                      <RoleIcon size={12} color={roleCfg.color} />
                      <Text style={[styles.roleText, { color: roleCfg.color }]}>
                        {roleCfg.label}
                      </Text>
                    </View>
                  </View>
                  {member.role !== "owner" && (
                    <TouchableOpacity
                      onPress={() =>
                        removeMember(member.id, displayedName(member))
                      }
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                {member.invited_email && (
                  <View style={styles.emailRow}>
                    <Mail size={12} color="#9CA3AF" />
                    <Text style={styles.emailText}>{member.invited_email}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convidar Membro</Text>
            <Text style={styles.modalSubtitle}>
              Envie um convite por email para gerenciar este negócio
            </Text>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />

            <Text style={styles.inputLabel}>Cargo</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  inviteRole === "admin" && styles.roleOptionActive,
                ]}
                onPress={() => setInviteRole("admin")}
              >
                <Shield
                  size={18}
                  color={inviteRole === "admin" ? "#3B82F6" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    inviteRole === "admin" && styles.roleOptionTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  inviteRole === "staff" && styles.roleOptionActive,
                ]}
                onPress={() => setInviteRole("staff")}
              >
                <Star
                  size={18}
                  color={inviteRole === "staff" ? "#6B7280" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    inviteRole === "staff" && styles.roleOptionTextActive,
                  ]}
                >
                  Colaborador
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  (!inviteEmail.trim() || sendingInvite) && { opacity: 0.5 },
                ]}
                onPress={sendInvite}
                disabled={!inviteEmail.trim() || sendingInvite}
              >
                {sendingInvite ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Convidar</Text>
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
    justifyContent: "space-between",
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00C853",
    justifyContent: "center",
    alignItems: "center",
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
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#00C853",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  memberPending: {
    opacity: 0.75,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  pendingBadge: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 10,
    color: "#D97706",
    fontWeight: "500",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  emailText: {
    fontSize: 12,
    color: "#9CA3AF",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
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
  },
  roleSelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  roleOptionActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  roleOptionTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
});
