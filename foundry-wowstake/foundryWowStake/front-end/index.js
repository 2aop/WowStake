import { ethers } from "./ethers-6.7.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const poolListButton = document.getElementById("poolListButton")
const stakeButton = document.getElementById("stakeButton")
const unstakeOrderButton = document.getElementById("unstakeOrderButton")
const unstakeOrderSelectGroup = document.getElementById(
  "unstakeOrderSelectGroup"
)
const balanceButton = document.getElementById("balanceButton")
const stakeModal = document.getElementById("stakeModal")
const stakeSelectBox = document.getElementById("stakeSelectBox")
const unstakePoolSelectBoxForOrder = document.getElementById(
  "unstakePoolSelectBoxForOrder"
)
const unstakeOrderSelectBoxForOrder = document.getElementById(
  "unstakeOrderSelectBoxForOrder"
)

const unstakeTypeChooseModal = document.getElementById("unstakeTypeChooseModal")
const unstakeTypeSelectBox = document.getElementById("unstakeTypeSelectBox")
const stakeAomunt = document.getElementById("stakeAmount")
const stakeSubmitBtn = document.getElementById("stakeSubmitBtn")
const stakeCancelBtn = document.getElementById("stakeCancelBtn")
const unstakeSubmitBtn = document.getElementById("unstakeSubmitBtn")
const unstakeCancelBtn = document.getElementById("unstakeCancelBtn")
const unstakeTypeSubmitBtn = document.getElementById("unstakeTypeSubmitBtn")
const unstakeTypeCancelBtn = document.getElementById("unstakeTypeCancelBtn")

const getAllMyOrderButton = document.getElementById("getAllMyOrderButton")
const getAllMyRewardsButton = document.getElementById("getAllMyRewardsButton")

connectButton.onclick = connect
poolListButton.onclick = getPoolList
getAllMyOrderButton.onclick = getUserStakeOrders
getAllMyRewardsButton.onclick = getAllUserRewards

let stakePoolList = [] // 声明一个空数组
let userStakeOrderList = []
let stakePoolId
let stakeAmount
let unstakeType = "order"
let selectedPoolId = 0
let userRewardsByPool = []
// balanceButton.onclick = getBalance;
window.onload = function () {
  connect()
  getPoolList()
  getUserStakeOrders()
}

// 点击按钮弹出模态框
stakeButton.addEventListener("click", function () {
  stakeModal.style.display = "flex" // 显示模态框
  stakePoolList.forEach((optionText, index) => {
    let option = document.createElement("option")
    option.textContent = index
    option.value = index // 设置 option 的值
    stakeSelectBox.appendChild(option)
  })
})

unstakeTypeCancelBtn.addEventListener("click", function () {
  unstakeTypeChooseModal.style.display = "none" // 隐藏模态框
})

unstakeTypeSubmitBtn.addEventListener("click", function () {
  unstakeTypeChooseModal.style.display = "none"
  unstakeModal.style.display = "flex" // 隐藏模态框
  unstakePoolSelectBoxForOrder.innerHTML = ""

  stakePoolList.forEach((optionText, index) => {
    let option = document.createElement("option")
    option.textContent = index
    option.value = index // 设置 option 的值
    unstakePoolSelectBoxForOrder.appendChild(option)
  })
  console.log(unstakeType)

  if ("pool" == unstakeType) {
    console.log("1111")
    unstakeOrderSelectGroup.style.display = "none" // 隐藏 "order id：" 下拉框所在的整个组
    unstakeOrderSelectBoxForOrder.disabled = true
  } else {
    console.log("22222")
    unstakeOrderSelectGroup.style.display = "flex"
    unstakeOrderSelectBoxForOrder.disabled = false

    updateUnstakeOrderSelectOptions(selectedPoolId)
  }
})
unstakeTypeSelectBox.addEventListener("change", function () {
  unstakeType = unstakeTypeSelectBox.value.trim()
  console.log("111111 " + unstakeTypeSelectBox.value.trim())
})
// 点击按钮弹出模态框
unstakeOrderButton.addEventListener("click", function () {
  unstakeTypeChooseModal.style.display = "flex"
})

unstakePoolSelectBoxForOrder.addEventListener("change", function () {
  selectedPoolId = parseInt(unstakePoolSelectBoxForOrder.value)
  console.log("orderr selectedPoolId" + selectedPoolId)

  // 根据选择的池子 ID 更新 unstakeOrderSelectBoxForOrder 的选项
  updateUnstakeOrderSelectOptions(selectedPoolId)
})

unstakeCancelBtn.addEventListener("click", function () {
  unstakeModal.style.display = "none" // 隐藏模态框
})
stakeCancelBtn.addEventListener("click", function () {
  stakeModal.style.display = "none" // 隐藏模态框
})
stakeSubmitBtn.addEventListener("click", function () {
  // 获取输入框的值
  const selectedPoolId = parseInt(stakeSelectBox.value)
  if (stakeAomunt.value.trim() === "") {
    alert("amount can not be blank")
    return
  }
  const stakeAmountValue = parseFloat(stakeAomunt.value)

  let valid = true

  // 校验输入值并设置错误样式
  if (
    stakeAmountValue <
    ethers.formatEther(stakePoolList[selectedPoolId].minDepositAmount)
  ) {
    alert(
      "pool: " +
        selectedPoolId +
        ",must stake more than " +
        ethers.formatEther(stakePoolList[selectedPoolId].minDepositAmount) +
        " token"
    )
    return
  } else {
    doStake(selectedPoolId, stakeAmountValue)
    stakeModal.style.display = "none"
  }

  // 根据业务需求处理其它逻辑，比如弹出提示框或者执行特定操作
  console.log("提交表单或执行其它操作...")
})

unstakeSubmitBtn.addEventListener("click", function () {
  unstakeModal.style.display = "none" // 隐藏模态框

  if (unstakePoolSelectBoxForOrder.value.trim() === "") {
    alert("pool id  can not be blank")
    return
  }
  if (
    "order" == unstakeType &&
    unstakeOrderSelectBoxForOrder.value.trim() === ""
  ) {
    alert("order id  can not be blank")
    return
  }
  // 获取输入框的值
  const selectedPoolId = parseInt(unstakePoolSelectBoxForOrder.value)
  const selectedOrderId = parseInt(unstakeOrderSelectBoxForOrder.value)

  doUnstake(selectedPoolId, selectedOrderId)
})

async function doStake(id, amount) {
  console.log("input amount ===" + ethers.parseEther(amount.toString()))
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.stake(id, {
        value: ethers.parseEther(amount.toString()),
      })
      await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
  }
}

async function doUnstake(poolId, orderId) {
  console.log(
    "unstakeType ==" +
      unstakeType +
      ",pid===" +
      poolId +
      ",,orderid===" +
      orderId
  )
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      let transactionResponse
      if ("order" == unstakeType) {
        transactionResponse = await contract.unstakeByOrder(poolId, orderId)
      } else {
        transactionResponse = await contract.unstakeByPool(poolId)
      }

      await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
  }
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected"
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function getUserStakeOrders() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      userStakeOrderList = []
      for (let i = 0; i < stakePoolList.length; i++) {
        const userStakeOrders = await contract.getUserStakeOrders(i)
        userStakeOrderList.push(...userStakeOrders)
      }
      console.log("getUserStakeOrders---" + userStakeOrderList.length)
      const tbody = document.querySelector("#order-table tbody")
      tbody.innerHTML = ""
      userStakeOrderList.forEach((item, index) => {
        const row = document.createElement("tr")
        // 创建表格单元格并填充数据

        const poolId = document.createElement("td")
        poolId.textContent = item.poolId
        row.appendChild(poolId)

        const indexCell = document.createElement("td")
        indexCell.textContent = index // 索引列
        row.appendChild(indexCell)

        const stakeAmount = document.createElement("td")
        stakeAmount.textContent = ethers.formatEther(item.stakeAmount)
        row.appendChild(stakeAmount)

        const stakeBlock = document.createElement("td")
        stakeBlock.textContent = item.stakeBlock
        row.appendChild(stakeBlock)

        const lastRewardBlock = document.createElement("td")
        lastRewardBlock.textContent = item.lastRewardBlock
        row.appendChild(lastRewardBlock)

        const expectReward = document.createElement("td")
        calculateOrderReward(item.poolId, index).then((value) => {
          expectReward.textContent = ethers.formatEther(value)
        })
        row.appendChild(expectReward)

        const valid = document.createElement("td")
        valid.textContent = item.valid
        row.appendChild(valid)

        tbody.appendChild(row)
      })

      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  }
}

async function calculateOrderReward(pid, orderid) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    let rewards
    try {
      rewards = await contract.expectRewardAmount(pid, orderid)

      console.log("rewards---" + rewards)
      return rewards
    } catch (error) {
      console.log(error)
    }
  }
}

async function getAllUserRewards() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      userRewardsByPool = []
      for (let i = 0; i < stakePoolList.length; i++) {
        const rewards = await contract.getUserTotalRewardByPool(i)
        userRewardsByPool.push(rewards)
      }
      console.log("getUserStakeOrders---" + userStakeOrderList.length)
      const tbody = document.querySelector("#reward-table tbody")
      tbody.innerHTML = ""
      userRewardsByPool.forEach((item, index) => {
        const row = document.createElement("tr")
        // 创建表格单元格并填充数据

        const poolId = document.createElement("td")
        poolId.textContent = index
        row.appendChild(poolId)

        const rewards = document.createElement("td")
        rewards.textContent = ethers.formatEther(item)
        row.appendChild(rewards)

        tbody.appendChild(row)
      })

      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  }
}

async function getPoolList() {
  console.log(`getPoolList...`)

  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const blockNumber = await provider.getBlockNumber()
    console.log("Current block number:", blockNumber)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log(contract)
    try {
      console.log("Processing transaction...")
      const transactionResponse = await contract.getAllPoolDetail()
      console.log(transactionResponse)
      stakePoolList = transactionResponse
      const tbody = document.querySelector("#pool-table tbody")
      tbody.innerHTML = ""
      transactionResponse.forEach((item, index) => {
        const row = document.createElement("tr")
        // 创建表格单元格并填充数据
        const indexCell = document.createElement("td")
        indexCell.textContent = index // 索引列
        row.appendChild(indexCell)

        const stTokenAddress = document.createElement("td")
        stTokenAddress.textContent = item.stTokenAddress
        row.appendChild(stTokenAddress)

        const poolWeight = document.createElement("td")
        poolWeight.textContent = item.poolWeight
        row.appendChild(poolWeight)

        const stTokenAmount = document.createElement("td")
        stTokenAmount.textContent = ethers.formatEther(item.stTokenAmount)
        row.appendChild(stTokenAmount)

        const minDepositAmount = document.createElement("td")
        minDepositAmount.textContent = ethers.formatEther(item.minDepositAmount)
        row.appendChild(minDepositAmount)

        const unstakeLockedBlocks = document.createElement("td")
        unstakeLockedBlocks.textContent = item.unstakeLockedBlocks
        console.log(item.stTokenAddress)
        row.appendChild(unstakeLockedBlocks)

        tbody.appendChild(row)
      })
      console.log(transactionResponse)

      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  }
}

function renderUserOrdersTable(list) {}

function updateUnstakeOrderSelectOptions(id) {
  console.log("updateUnstakeOrderSelectOptions-----+" + id)

  let reducedOrderList = []
  for (let i = 0; i < userStakeOrderList.length; i++) {
    if (Number(userStakeOrderList[i].poolId) == id) {
      reducedOrderList.push(userStakeOrderList[i])
    }
  }

  unstakeOrderSelectBoxForOrder.innerHTML = ""

  reducedOrderList.forEach((optionText, index) => {
    let option = document.createElement("option")
    if (optionText.valid == "true") {
      option.textContent = index
      option.value = index
    } // 设置 option 的值
    unstakeOrderSelectBoxForOrder.appendChild(option)
  })
}

// async function fund() {
//   const ethAmount = document.getElementById("ethAmount").value;
//   console.log(`Funding with ${ethAmount}...`);
//   if (typeof window.ethereum !== "undefined") {
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     const signer = await provider.getSigner();
//     const contract = new ethers.Contract(contractAddress, abi, signer);
//     try {
//       const transactionResponse = await contract.fund(
//         2,
//         "0x0000000000000000000000000000000000000000",
//         {
//           value: ethers.utils.parseEther(ethAmount),
//         }
//       );
//       await transactionResponse.wait(1);
//     } catch (error) {
//       console.log(error);
//     }
//   } else {
//     fundButton.innerHTML = "Please install MetaMask";
//   }
// }

// async function getBalance() {
//   if (typeof window.ethereum !== "undefined") {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     try {
//       const balance = await provider.getBalance(contractAddress);
//       console.log(ethers.utils.formatEther(balance));
//     } catch (error) {
//       console.log(error);
//     }
//   } else {
//     balanceButton.innerHTML = "Please install MetaMask";
//   }
// }
