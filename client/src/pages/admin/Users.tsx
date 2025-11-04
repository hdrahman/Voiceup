import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { User, Role } from '@shared/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { ArrowLeft, UserX, UserCheck, Shield } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserWithStats extends User {
    _count?: {
        reports: number
        comments: number
        upvotes: number
    }
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
    const [actionType, setActionType] = useState<'ban' | 'role' | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await api.getUsers()
            setUsers(data as UserWithStats[])
        } catch (error) {
            toast.error('Failed to load users')
            console.error('Failed to load users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: Role) => {
        try {
            await api.updateUserRole(userId, { role: newRole })
            toast.success('User role updated!')
            loadUsers()
        } catch (error) {
            toast.error('Failed to update role')
        }
    }

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        try {
            await api.updateUserBan(userId, { isBanned })
            toast.success(isBanned ? 'User banned' : 'User unbanned')
            setSelectedUser(null)
            setActionType(null)
            loadUsers()
        } catch (error) {
            toast.error('Failed to update ban status')
        }
    }

    return (
        <div className="container py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link to="/admin">
                            <Button variant="ghost" className="mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-4xl font-bold">Manage Users</h1>
                        <p className="text-muted-foreground mt-2">View and manage user accounts</p>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Loading users...</p>
                    </Card>
                ) : users.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground">No users found</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {users.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-6">
                                    <div className="flex items-center justify-between">
                                        {/* User Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-lg">{user.email}</h3>
                                                {user.isBanned && (
                                                    <Badge variant="destructive">Banned</Badge>
                                                )}
                                                {user.role === Role.ADMIN && (
                                                    <Badge variant="default" className="bg-blue-500">
                                                        <Shield className="mr-1 h-3 w-3" />
                                                        Admin
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                <span>Joined {formatRelativeTime(user.createdAt)}</span>
                                                {user._count && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{user._count.reports} reports</span>
                                                        <span>•</span>
                                                        <span>{user._count.comments} comments</span>
                                                        <span>•</span>
                                                        <span>{user._count.upvotes} upvotes</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={user.role}
                                                onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={Role.CITIZEN}>Citizen</SelectItem>
                                                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant={user.isBanned ? 'outline' : 'destructive'}
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setActionType('ban')
                                                }}
                                            >
                                                {user.isBanned ? (
                                                    <>
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Unban
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Ban
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Confirmation Dialog */}
            <Dialog open={actionType === 'ban'} onOpenChange={() => setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser?.isBanned
                                ? `Are you sure you want to unban ${selectedUser?.email}? They will regain access to the platform.`
                                : `Are you sure you want to ban ${selectedUser?.email}? They will lose access to the platform.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant={selectedUser?.isBanned ? 'default' : 'destructive'}
                            onClick={() => {
                                if (selectedUser) {
                                    handleBanToggle(selectedUser.id, !selectedUser.isBanned)
                                }
                            }}
                        >
                            {selectedUser?.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
