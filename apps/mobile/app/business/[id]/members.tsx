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
import { api } from "../../../src/lib/api-client";
import { memberApi } from "../../../src/lib/api-business";
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
import { useTranslation } from "../../../src/lib/i18n-provider";

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

const ROLE_CONFIG: Record<string, { labelKey: string; color: string; icon: any }> = {
  owner: { labelKey: "business.role_owner", color: "#D97706", icon: Crown },
  admin: { labelKey: "business.role_admin", color: "#3B82F6", icon: Shield },
  staff: { labelKey: "business.role_staff", color: "#6B7280", icon: Star },
};

export default function MembersScreen() {
  const router = useRouter();
  const { id: businessId } = useLocalSearchParams();
  const { t } = useTranslation();

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
      const data = await memberApi.list(businessId);
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
      await memberApi.invite({
        business_id: businessId,
        invited_email: inviteEmail.trim(),
        role: inviteRole,
        status: "pending",
      });

      Alert.alert(t("business.invite_sent"), t("business.invite_sent_desc", { email: inviteEmail }));
      setShowInviteModal(false);
      setInviteEmail("");
      loadMembers();
    } catch (err: any) {
      Alert.alert(t("errors.generic"), err.message);
    } finally {
      setSendingInvite(false);
    }
  }

  async function removeMember(memberId: string, name: string) {
    Alert.alert(t("business.remove_member"), t("business.remove_member_confirm", { name }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await memberApi.remove(memberId);
          setMembers(members.filter((m) => m.id !== memberId));
        },
      },
    ]);
  }

  const displayedName = (m: MemberData) =>
    m.user_name || m.user_email || m.invited_email || t("common.name");

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
        <Text style={styles.headerTitle}>{t("business.members")}</Text>
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
            <Text style={styles.emptyTitle}>{t("business.no_members")}</Text>
            <Text style={styles.emptyText}>
              {t("business.invite_people_desc")}
            </Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => setShowInviteModal(true)}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>{t("business.invite_member")}</Text>
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
                          <Text style={styles.pendingText}>{t("public.status_pending")}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.roleRow}>
                      <RoleIcon size={12} color={roleCfg.color} />
                      <Text style={[styles.roleText, { color: roleCfg.color }]}>
                        {t(roleCfg.labelKey)}
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
            <Text style={styles.modalTitle}>{t("business.invite_member")}</Text>
            <Text style={styles.modalSubtitle}>
              {t("business.invite_people_desc")}
            </Text>

            <Text style={styles.inputLabel}>{t("common.email")}</Text>
            <TextInput
              style={styles.modalInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder={t("auth.email_placeholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />

            <Text style={styles.inputLabel}>{t("common.category")}</Text>
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
                  {t("business.role_admin")}
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
                  {t("business.role_staff")}
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
                <Text style={styles.modalCancelText}>{t("common.cancel")}</Text>
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
                  <Text style={styles.modalConfirmText}>{t("business.invite_member")}</Text>
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
