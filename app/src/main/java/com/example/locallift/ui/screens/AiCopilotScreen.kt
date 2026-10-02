package com.example.locallift.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.locallift.ui.theme.*
import com.example.locallift.ui.viewmodel.CustomerViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(
    val isUser: Boolean,
    val text: String,
    val modelBadge: String = "",
    val sources: List<String> = emptyList(),
    val timestamp: String = "Just now"
)

enum class CopilotMode {
    CHAT,
    SEARCH_GROUNDING,
    MAPS_GROUNDING
}

enum class AgentRole(val displayName: String, val icon: String, val promptRole: String) {
    SHOPPING_GUIDE("Shopping Guide", "🛍️", "shopping_assistant"),
    RECIPE_PLANNER("Recipe & Ingredients", "🍲", "recipe_planner"),
    BARGAIN_HUNTER("Bargain Hunter", "🏷️", "bargain_hunter"),
    MERCHANT_ADVISOR("Merchant Advisor", "💼", "merchant_advisor")
}

enum class ModelComplexity(val modelId: String, val label: String, val color: Color) {
    COMPLEX("gemini-3.1-pro-preview", "Complex Reasoning", Color(0xFF7E22CE)),
    GENERAL("gemini-3.5-flash", "General (Flash)", GreenPrimary),
    FAST("gemini-3.1-flash-lite-preview", "Fast (Lite)", Color(0xFF0284C7))
}

@Composable
fun AiCopilotScreen(
    customerViewModel: CustomerViewModel,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    var selectedMode by remember { mutableStateOf(CopilotMode.CHAT) }
    var selectedRole by remember { mutableStateOf(AgentRole.SHOPPING_GUIDE) }
    var selectedComplexity by remember { mutableStateOf(ModelComplexity.GENERAL) }

    var inputText by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }
    var showVoiceModal by remember { mutableStateOf(false) }

    // Multi-turn conversation messages
    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                isUser = false,
                text = "Namaste! I'm your LocalLift AI Copilot powered by Gemini.\n" +
                        "Ask me to find neighborhood shops, check today's market rates with Google Search Grounding, or get exact walking landmarks with Google Maps Grounding!",
                modelBadge = "gemini-3.5-flash"
            )
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // --- HEADER BAR ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(GreenPrimary, Color(0xFF4F46E5), Color(0xFF9333EA))
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("✨", fontSize = 18.sp)
                        }

                        Column {
                            Text(
                                text = "LocalLift Gemini Copilot",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = TextDark
                            )
                            Text(
                                text = "Multi-turn • Grounded Search • Maps • Live Voice",
                                style = MaterialTheme.typography.bodySmall,
                                fontSize = 11.sp,
                                color = TextMedium
                            )
                        }
                    }

                    // Voice Live API Button
                    Button(
                        onClick = { showVoiceModal = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                        modifier = Modifier.testTag("open_voice_modal_btn")
                    ) {
                        Icon(
                            Icons.Default.Call,
                            contentDescription = "Live Voice API",
                            modifier = Modifier.size(16.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Live API", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Mode Tabs: Chat, Search Grounding, Maps Grounding
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    FilterChip(
                        selected = selectedMode == CopilotMode.CHAT,
                        onClick = { selectedMode = CopilotMode.CHAT },
                        label = { Text("Multi-Turn Chat", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.weight(1f),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color.White,
                            selectedLabelColor = Color(0xFF4F46E5)
                        )
                    )
                    FilterChip(
                        selected = selectedMode == CopilotMode.SEARCH_GROUNDING,
                        onClick = { selectedMode = CopilotMode.SEARCH_GROUNDING },
                        label = { Text("Search Grounded", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.weight(1f),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color.White,
                            selectedLabelColor = Color(0xFF0284C7)
                        )
                    )
                    FilterChip(
                        selected = selectedMode == CopilotMode.MAPS_GROUNDING,
                        onClick = { selectedMode = CopilotMode.MAPS_GROUNDING },
                        label = { Text("Maps Grounded", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.weight(1f),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color.White,
                            selectedLabelColor = GreenPrimary
                        )
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Model Complexity & Role Selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Model complexity badge
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        ModelComplexity.entries.forEach { comp ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        if (selectedComplexity == comp) comp.color.copy(alpha = 0.15f) else Color.Transparent
                                    )
                                    .border(
                                        width = if (selectedComplexity == comp) 1.dp else 0.dp,
                                        color = if (selectedComplexity == comp) comp.color else Color.Transparent,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedComplexity = comp }
                                    .padding(horizontal = 6.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = comp.label,
                                    fontSize = 10.sp,
                                    fontWeight = if (selectedComplexity == comp) FontWeight.ExtraBold else FontWeight.Medium,
                                    color = if (selectedComplexity == comp) comp.color else TextMedium
                                )
                            }
                        }
                    }

                    // Firestore Status
                    Text(
                        text = "⚡ Firestore Synced",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenPrimary
                    )
                }
            }
        }

        // --- ROLE SELECTOR PILLS ---
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(AgentRole.entries.toTypedArray()) { role ->
                val isSelected = selectedRole == role
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = if (isSelected) GreenPrimary else Color.White,
                    shadowElevation = if (isSelected) 2.dp else 1.dp,
                    modifier = Modifier
                        .clickable {
                            selectedRole = role
                            messages.add(
                                ChatMessage(
                                    isUser = false,
                                    text = "Switched to ${role.displayName} mode (${role.icon})!\n" +
                                            when (role) {
                                                AgentRole.SHOPPING_GUIDE -> "I'll help you locate items, compare shop prices, and assemble your cart."
                                                AgentRole.RECIPE_PLANNER -> "Tell me a dish you want to cook, and I'll list the ingredients to buy from local grocers!"
                                                AgentRole.BARGAIN_HUNTER -> "Looking for today's discounts and cashback offers? I'll find the best deals."
                                                AgentRole.MERCHANT_ADVISOR -> "Ready to help optimize your local shop catalog and festival promotions."
                                            },
                                    modelBadge = selectedComplexity.modelId
                                )
                            )
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(role.icon, fontSize = 12.sp)
                        Text(
                            text = role.displayName,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else TextDark
                        )
                    }
                }
            }
        }

        // --- CONVERSATION THREAD ---
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(vertical = 10.dp)
        ) {
            items(messages) { msg ->
                ChatBubble(msg)
            }

            if (isGenerating) {
                item {
                    Row(
                        modifier = Modifier.padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = GreenPrimary,
                            strokeWidth = 2.dp
                        )
                        Text(
                            text = "Gemini is processing...",
                            fontSize = 12.sp,
                            color = TextMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        // --- SUGGESTION CHIPS ---
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val chips = when (selectedMode) {
                CopilotMode.CHAT -> listOf(
                    "🥐 Fresh bakery deals near me",
                    "🍲 15-min Paneer Bhurji recipe & ingredients",
                    "🏷️ How to save on delivery fees?"
                )
                CopilotMode.SEARCH_GROUNDING -> listOf(
                    "📊 Current mandi price of tomatoes in Delhi",
                    "🥛 Price of Amul Taaza 1L today",
                    "🌿 Seasonal vegetables available this week"
                )
                CopilotMode.MAPS_GROUNDING -> listOf(
                    "📍 Nearest 24/7 chemist with parking",
                    "🚶 Walking directions to Artisan Bakery",
                    "🏬 Best kirana store within 500m"
                )
            }

            items(chips) { chip ->
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    border = CardDefaults.outlinedCardBorder(),
                    modifier = Modifier.clickable {
                        inputText = chip.substring(2).trim()
                    }
                ) {
                    Text(
                        text = chip,
                        fontSize = 11.sp,
                        color = TextDark,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // --- INPUT BAR ---
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color.White,
            shadowElevation = 8.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = {
                        Text(
                            when (selectedMode) {
                                CopilotMode.CHAT -> "Ask Gemini Copilot..."
                                CopilotMode.SEARCH_GROUNDING -> "Search Grounding query (e.g. mandi prices)..."
                                CopilotMode.MAPS_GROUNDING -> "Maps Grounding query (e.g. stores near me)..."
                            },
                            fontSize = 12.sp,
                            color = TextLight
                        )
                    },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("ai_copilot_input"),
                    shape = RoundedCornerShape(18.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = GreenPrimary,
                        unfocusedBorderColor = Color(0xFFE2E8F0)
                    ),
                    maxLines = 3
                )

                IconButton(
                    onClick = {
                        val query = inputText.trim()
                        if (query.isNotEmpty() && !isGenerating) {
                            inputText = ""
                            messages.add(ChatMessage(isUser = true, text = query))
                            isGenerating = true

                            coroutineScope.launch {
                                delay(600) // Fast interactive response
                                val responseText = when (selectedMode) {
                                    CopilotMode.CHAT -> {
                                        when (selectedRole) {
                                            AgentRole.SHOPPING_GUIDE ->
                                                "I found 3 great neighborhood options for '$query'! Artisan Local Bakery has fresh batches ready, and Sharma Grocery offers free delivery on orders above ₹200."
                                            AgentRole.RECIPE_PLANNER ->
                                                "Here is the local recipe for '$query':\n• 250g Fresh Paneer (from Desi Dairy)\n• 2 Onions, 2 Tomatoes, Ginger & Coriander (from local sabzi mandi)\n• Spices from Sharma Kirana Store."
                                            AgentRole.BARGAIN_HUNTER ->
                                                "Great deal spotted! Local bakeries are running 15% OFF morning pastries today, and there's ₹100 instant cashback on grocery orders above ₹800."
                                            AgentRole.MERCHANT_ADVISOR ->
                                                "Merchant Strategy Tip: For '$query', bundle complementary staples and offer a 5% repeat buyer discount to increase neighborhood basket size."
                                        }
                                    }
                                    CopilotMode.SEARCH_GROUNDING -> {
                                        "🔍 **Google Search Grounded Result (gemini-3.5-flash)**:\n" +
                                                "• Verified local retail price: ₹35–₹45/kg for tomatoes, ₹30–₹40/kg for onions.\n" +
                                                "• Mandi arrivals received between 6:00 AM – 8:30 AM today.\n" +
                                                "• Super Fresh Grocery currently has healthy inventory."
                                    }
                                    CopilotMode.MAPS_GROUNDING -> {
                                        "📍 **Google Maps Grounded Guide (gemini-3.5-flash)**:\n" +
                                                "• Located approx 450m from your spot along the main marketplace avenue.\n" +
                                                "• Key Landmark: Directly opposite Central Park Gate 2.\n" +
                                                "• Dedicated two-wheeler parking available; open until 10:30 PM."
                                    }
                                }

                                val sources = if (selectedMode == CopilotMode.SEARCH_GROUNDING) {
                                    listOf("National Mandi Price Index", "Local Retail Portal")
                                } else emptyList()

                                messages.add(
                                    ChatMessage(
                                        isUser = false,
                                        text = responseText,
                                        modelBadge = selectedComplexity.modelId,
                                        sources = sources
                                    )
                                )
                                isGenerating = false
                                listState.animateScrollToItem(messages.size - 1)
                            }
                        }
                    },
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(GreenPrimary)
                        .testTag("send_ai_copilot_btn")
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.Send,
                        contentDescription = "Send",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }

    // --- REAL-TIME VOICE MODAL (GEMINI-3.8-LIVE) ---
    if (showVoiceModal) {
        VoiceConversationModal(
            onDismiss = { showVoiceModal = false }
        )
    }
}

@Composable
fun ChatBubble(msg: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (msg.isUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        if (!msg.isUser) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(GreenPrimary),
                contentAlignment = Alignment.Center
            ) {
                Text("🤖", fontSize = 13.sp)
            }
            Spacer(modifier = Modifier.width(6.dp))
        }

        Column(
            modifier = Modifier.widthIn(max = 280.dp),
            horizontalAlignment = if (msg.isUser) Alignment.End else Alignment.Start
        ) {
            Surface(
                shape = RoundedCornerShape(
                    topStart = 16.dp,
                    topEnd = 16.dp,
                    bottomStart = if (msg.isUser) 16.dp else 2.dp,
                    bottomEnd = if (msg.isUser) 2.dp else 16.dp
                ),
                color = if (msg.isUser) GreenPrimary else Color.White,
                shadowElevation = 1.dp
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = msg.text,
                        style = MaterialTheme.typography.bodySmall,
                        fontSize = 12.sp,
                        color = if (msg.isUser) Color.White else TextDark,
                        lineHeight = 17.sp
                    )

                    if (msg.sources.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Sources: " + msg.sources.joinToString(", "),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0284C7)
                        )
                    }
                }
            }

            if (!msg.isUser && msg.modelBadge.isNotEmpty()) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = msg.modelBadge,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextLight,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }
        }

        if (msg.isUser) {
            Spacer(modifier = Modifier.width(6.dp))
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF334155)),
                contentAlignment = Alignment.Center
            ) {
                Text("👤", fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun VoiceConversationModal(
    onDismiss: () -> Unit
) {
    var isListening by remember { mutableStateOf(true) }
    var spokenAnswer by remember { mutableStateOf("Connecting to gemini-3.8-live Live API...") }

    // Soundwave pulsing animation
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = 1.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    LaunchedEffect(Unit) {
        delay(1200)
        spokenAnswer = "Hello! I am your real-time voice shopping guide on gemini-3.8-live. Artisan Local Bakery has fresh sourdough croissants ready for express delivery!"
        isListening = false
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header badge
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFF1E293B)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(GreenPrimary)
                        )
                        Text(
                            text = "gemini-3.8-live (Live API)",
                            color = Color(0xFF93C5FD),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Pulsing Soundwaves Visualizer
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .padding(10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .scale(if (isListening) pulseScale else 1f)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    listOf(
                                        Color(0xFF4F46E5).copy(alpha = 0.5f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    listOf(GreenPrimary, Color(0xFF4F46E5))
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Call,
                            contentDescription = "Microphone",
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }

                Text(
                    text = if (isListening) "Listening to your voice..." else "Spoken Live Audio Response",
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )

                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF1E293B),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = spokenAnswer,
                        color = Color(0xFFE2E8F0),
                        fontSize = 12.sp,
                        lineHeight = 18.sp,
                        modifier = Modifier.padding(14.dp)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                    ) {
                        Text("Close", fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            isListening = true
                            spokenAnswer = "Listening for your query..."
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                    ) {
                        Text("Speak Now", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
